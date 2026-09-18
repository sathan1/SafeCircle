import { getWsBaseUrl } from './apiConfig';

class LiveSyncService {
  constructor() {
    this.socket = null;
    this.token = null;
    this.listeners = new Set();
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect(token) {
    if (!token) return;
    this.token = token;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const wsUrl = `${getWsBaseUrl()}?token=${encodeURIComponent(token)}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('[LiveSync] WebSocket connected to backend gateway');
        this.emit('GATEWAY_CONNECTED', { connected: true });
        
        // Send IDENTIFY message
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'IDENTIFY', token }));
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data.payload);
        } catch (err) {
          console.warn('[LiveSync] Error parsing message:', err.message);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.emit('GATEWAY_DISCONNECTED', { connected: false });
        this._scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[LiveSync] WebSocket connection error:', err);
      };
    } catch (e) {
      console.warn('[LiveSync] Failed to initialize WebSocket:', e.message);
      this._scheduleReconnect();
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, 4000);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  emit(type, payload) {
    for (const listener of this.listeners) {
      try {
        listener(type, payload);
      } catch (err) {
        console.error('[LiveSync] Listener error:', err);
      }
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.token = null;
    this.isConnected = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const liveSyncService = new LiveSyncService();
export default liveSyncService;
