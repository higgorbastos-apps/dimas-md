import { Storage } from '../utils/storage';

export class GoogleSheetsAPI {
  static getConfig() {
    return Storage.getConfig();
  }

  static async call(action, data = {}) {
    const config = this.getConfig();
    
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: action,
        token: config.token,
        ...data
      })
    });

    if (!response.ok) throw new Error('HTTP error');
    return response.json();
  }

  static async getResumo() {
    return this.call('resumo');
  }

  static async getMemorias(limit = 30) {
    return this.call('ler_memoria', { limit });
  }

  static async saveMemoria(categoria, conteudo, relevancia = 1) {
    return this.call('salvar_memoria', { categoria, conteudo, relevancia });
  }
  static async salvarConversa(dispositivo, mensagens) {
    return this.call('salvar_conversa', { dispositivo, mensagens });
  }
  static async carregarConversas(dispositivo, limite = 20) {
    return this.call('carregar_conversas', { dispositivo, limite });
  }
  static getDeviceId() {
    let id = Storage.get('device_id');
    if (!id) {
      id = 'device_' + Date.now();
      Storage.set('device_id', id);
    }
    return id;
  }
    static async gerarCodigo() {
    return this.call('gerar_codigo');
  }
  static async vincularDispositivos(codigo, dispositivo) {
    return this.call('vincular_dispositivos', { codigo, dispositivo });
  }
}
