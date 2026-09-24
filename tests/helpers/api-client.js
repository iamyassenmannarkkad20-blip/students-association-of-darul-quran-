/**
 * SADQ Platform E2E Test Suite - Session-Aware API Client
 */

const { API_URL } = require('./config');

class ApiClient {
  constructor(baseUrl = API_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.cookies = new Map();
    this.currentUser = null;
  }

  // Clone this client instance (e.g. for creating new isolated user sessions)
  clone() {
    const newClient = new ApiClient(this.baseUrl);
    for (const [k, v] of this.cookies.entries()) {
      newClient.cookies.set(k, v);
    }
    newClient.currentUser = this.currentUser;
    return newClient;
  }

  setCookie(name, value) {
    this.cookies.set(name, value);
  }

  getCookie(name) {
    return this.cookies.get(name);
  }

  clearCookies() {
    this.cookies.clear();
    this.currentUser = null;
  }

  getCookieHeader() {
    const pairs = [];
    for (const [key, val] of this.cookies.entries()) {
      pairs.push(`${key}=${val}`);
    }
    return pairs.join('; ');
  }

  parseSetCookie(headers) {
    // In native fetch, headers.getSetCookie() or headers.get('set-cookie')
    let setCookieValues = [];
    if (typeof headers.getSetCookie === 'function') {
      setCookieValues = headers.getSetCookie();
    } else {
      const raw = headers.get('set-cookie');
      if (raw) setCookieValues = [raw];
    }

    for (const sc of setCookieValues) {
      const parts = sc.split(';');
      const [nameVal] = parts;
      if (nameVal) {
        const eqIdx = nameVal.indexOf('=');
        if (eqIdx !== -1) {
          const key = nameVal.slice(0, eqIdx).trim();
          const val = nameVal.slice(eqIdx + 1).trim();
          if (val === '' || val === 'deleted') {
            this.cookies.delete(key);
          } else {
            this.cookies.set(key, val);
          }
        }
      }
    }
  }

  async request(method, endpoint, body = null, customHeaders = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      Accept: 'application/json',
      ...customHeaders,
    };

    if (body !== null && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const cookieHeader = this.getCookieHeader();
    if (cookieHeader && !headers['Cookie']) {
      headers['Cookie'] = cookieHeader;
    }

    const fetchOptions = {
      method,
      headers,
    };

    if (body !== null) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    this.parseSetCookie(response.headers);

    let parsedBody = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        parsedBody = await response.json();
      } catch (e) {
        parsedBody = null;
      }
    } else {
      parsedBody = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: parsedBody,
    };
  }

  get(endpoint, headers = {}) {
    return this.request('GET', endpoint, null, headers);
  }

  post(endpoint, body, headers = {}) {
    return this.request('POST', endpoint, body, headers);
  }

  patch(endpoint, body, headers = {}) {
    return this.request('PATCH', endpoint, body, headers);
  }

  delete(endpoint, headers = {}) {
    return this.request('DELETE', endpoint, null, headers);
  }

  // High-level Auth helpers
  async register(studentData) {
    const res = await this.post('/api/v1/auth/register', studentData);
    if (res.status === 201 && res.body?.data?.user) {
      this.currentUser = res.body.data.user;
    }
    return res;
  }

  async login(email, password) {
    const res = await this.post('/api/v1/auth/login', { email, password });
    if (res.status === 200 && res.body?.data?.user) {
      this.currentUser = res.body.data.user;
    }
    return res;
  }

  async logout() {
    const res = await this.post('/api/v1/auth/logout', {});
    this.currentUser = null;
    return res;
  }

  async getMe() {
    return this.get('/api/v1/auth/me');
  }
}

module.exports = ApiClient;
