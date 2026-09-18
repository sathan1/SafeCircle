const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';

class SocketService {
  constructor() {
    this.wss = null;
    // Map of userId -> Set of WebSocket clients
    this.userSockets = new Map();
    // Set of all active clients
    this.clients = new Set();
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      ws.isAlive = true;
      ws.userId = null;
      this.clients.add(ws);

      // Extract token from query string if present: ?token=...
      try {
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('token');
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded && decoded.userId) {
            this._registerUserSocket(decoded.userId, ws);
          }
        }
      } catch (e) {
        // Handshake without initial token is fine; client will send IDENTIFY message
      }

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (messageRaw) => {
        try {
          const data = JSON.parse(messageRaw.toString());
          this._handleClientMessage(ws, data);
        } catch (err) {
          console.warn('[WebSocket] Malformed message received:', err.message);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        if (ws.userId) {
          this._removeUserSocket(ws.userId, ws);
        }
      });

      ws.on('error', (err) => {
        console.warn('[WebSocket] Socket error:', err.message);
      });

      // Send initial welcome message
      this._send(ws, 'CONNECTED', {
        serverTime: new Date().toISOString(),
        message: 'SafeCircle Real-Time Gateway connected'
      });
    });

    // Heartbeat ping interval (every 30 seconds)
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });

    console.log('[SafeCircle] WebSocket Gateway initialized on /ws');
  }

  _registerUserSocket(userId, ws) {
    ws.userId = userId;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(ws);
    console.log(`[WebSocket] User identified: ${userId} (${this.userSockets.get(userId).size} active sessions)`);
  }

  _removeUserSocket(userId, ws) {
    if (this.userSockets.has(userId)) {
      const set = this.userSockets.get(userId);
      set.delete(ws);
      if (set.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  _handleClientMessage(ws, data) {
    if (data.type === 'IDENTIFY') {
      try {
        const decoded = jwt.verify(data.token, JWT_SECRET);
        if (decoded && decoded.userId) {
          this._registerUserSocket(decoded.userId, ws);
          this._send(ws, 'IDENTIFIED', { success: true, userId: decoded.userId });
        }
      } catch (err) {
        this._send(ws, 'ERROR', { message: 'Invalid authentication token' });
      }
    } else if (data.type === 'PING') {
      this._send(ws, 'PONG', { timestamp: Date.now() });
    }
  }

  _send(ws, type, payload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    }
  }

  /**
   * Dispatches an event directly to a specific user's active sockets
   */
  sendToUser(userId, eventType, payload) {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      for (const ws of sockets) {
        this._send(ws, eventType, payload);
      }
      return true;
    }
    return false;
  }

  /**
   * Broadcasts an event to all trusted contacts in a list, applying custom per-contact payload filter
   */
  broadcastToCircle(contactUserIds, eventType, payloadGenerator) {
    for (const contactUserId of contactUserIds) {
      if (this.userSockets.has(contactUserId)) {
        const payload = typeof payloadGenerator === 'function' 
          ? payloadGenerator(contactUserId) 
          : payloadGenerator;
        if (payload) {
          this.sendToUser(contactUserId, eventType, payload);
        }
      }
    }
  }

  /**
   * Broadcasts an event to all connected clients
   */
  broadcastAll(eventType, payload) {
    for (const ws of this.clients) {
      this._send(ws, eventType, payload);
    }
  }
}

module.exports = new SocketService();
