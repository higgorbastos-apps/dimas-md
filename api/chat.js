export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { system, messages, model, max_tokens, provider } = req.body;
    const selectedProvider = provider || 'claude';

    if (selectedProvider === 'claude') {
      return await callClaude(system, messages, model, max_tokens, res);
    } else if (selectedProvider === 'gemini') {
      return await callGemini(system, messages, res);
    } else if (selectedProvider === 'deepseek') {
      return await callDeepSeek(system, messages, res);
    } else {
      return res.status(400).json({ error: 'Provider inválido' });
    }
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// CLAUDE (Anthropic)
// ============================================
async function callClaude(system, messages, model, max_tokens, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-5',
      max_tokens: max_tokens || 4000,
      system: system,
      messages: messages
    })
  });

  const text = await response.text();
  if (!response.ok) return res.status(response.status).json({ error: text });
  
  const data = JSON.parse(text);
  return res.status(200).json(data);
}

// ============================================
// GEMINI (Google)
// ============================================
async function callGemini(system, messages, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });

  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 2000 }
      })
    }
  );

  const text = await response.text();
  if (!response.ok) return res.status(response.status).json({ error: text });
  
  const data = JSON.parse(text);
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return res.status(200).json({ content: [{ text: content }] });
}
// ============================================
// DEEPSEEK
// ============================================
async function callDeepSeek(system, messages, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'DEEPSEEK_API_KEY não configurada' });

  // Adiciona system como primeira mensagem
  const deepseekMessages = [
    { role: 'system', content: system },
    ...messages
  ];

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: deepseekMessages,
      max_tokens: 4000
    })
  });

  const text = await response.text();
  if (!response.ok) return res.status(response.status).json({ error: text });
  
  const data = JSON.parse(text);
  
  // Converte resposta DeepSeek → formato Claude
  const content = data.choices?.[0]?.message?.content || '';
  return res.status(200).json({ content: [{ text: content }] });
}
