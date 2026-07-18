export class ResponseCache {
  static generateKey(message) {
    return 'cache_' + message
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .sort()
      .join('_')
      .substring(0, 50);
  }

  static get(message) {
    try {
      const key = this.generateKey(message);
      const cached = localStorage.getItem('dimas_' + key);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.t < 86400000) {
          console.log('💾 Cache hit!');
          return data.r;
        }
      }
    } catch(e) {}
    return null;
  }

  static set(message, response) {
    try {
      const key = this.generateKey(message);
      localStorage.setItem('dimas_' + key, JSON.stringify({
        r: response,
        t: Date.now()
      }));
    } catch(e) {}
  }
}

export class ModelRouter {
  static selectModel(message) {
    const simple = /^(oi|olá|bom dia|boa (tarde|noite)|obrigado|valeu|sim|não|ok|claro)$/i;
    const medium = /(quantos|quais|lista|músicas|shows|nome)/i;
    
    if (simple.test(message.trim())) return 'claude-haiku-4-5-20251001';
    if (medium.test(message)) return 'claude-haiku-4-5-20251001';
    return 'claude-sonnet-5';
  }

  static getMaxTokens(message) {
    return message.length > 200 ? 2000 : 500;
  }
}