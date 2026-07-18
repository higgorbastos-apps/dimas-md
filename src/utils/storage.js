export class Storage {
  static get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem('dimas_' + key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (e) {
      return window['__dimas_' + key] || defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem('dimas_' + key, JSON.stringify(value));
    } catch (e) {
      window['__dimas_' + key] = value;
    }
  }

  static getConfig() {
    return {
      url: Storage.get('url', ''),
      token: Storage.get('token', '')
    };
  }

  static setConfig(url, token) {
    Storage.set('url', url);
    Storage.set('token', token);
  }

  static getProfile() {
    return Storage.get('profile');
  }

  static setProfile(profile) {
    Storage.set('profile', profile);
  }

  static getConversation() {
    return Storage.get('conversation', []);
  }

  static setConversation(conversation) {
    Storage.set('conversation', conversation);
  }
}