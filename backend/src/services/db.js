const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'safecircle_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB template
const INITIAL_DATA = {
  users: [],
  otps: [],
  contacts: [],
  invitations: [],
  journeys: [],
  journeyEvents: [],
  escalations: [],
  checkIns: [],
  auditLogs: []
};

// Pre-seeded demo accounts with bcrypt password hashes
// Passwords:
// user@safecircle.app -> SafeUser123!
// mom@safecircle.app  -> MomSecure123!
// dad@safecircle.app  -> DadSecure123!
const DEFAULT_SEEDED_USERS = [
  {
    id: 'user_person_1',
    name: 'Person User',
    email: 'user@safecircle.app',
    passwordHash: '$2b$10$6cZnStBjy0KmNiXJlBJBRuSUA4b022tJwPs2RAiFjDOm0gXDBXohi',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user_mom_1',
    name: 'Mom',
    email: 'mom@safecircle.app',
    passwordHash: '$2b$10$8Lf.gBm0fUDvRUj8d7wOpexjaGcbcMF1MmUPMRX/OzW1be3Xq9DKK',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user_dad_1',
    name: 'Dad',
    email: 'dad@safecircle.app',
    passwordHash: '$2b$10$nvmiG23zwMqRG4gj7gRjQe0A62g5vAqIcWg3JTfYF30eBIzzTSgc6',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

class Database {
  constructor() {
    this.dbFile = DB_FILE;
    this.memoryData = this._load();
    this.writeQueue = Promise.resolve();
  }

  _load() {
    let data;
    try {
      if (fs.existsSync(this.dbFile)) {
        const content = fs.readFileSync(this.dbFile, 'utf8');
        data = Object.assign({}, INITIAL_DATA, JSON.parse(content));
      }
    } catch (e) {
      console.warn('[DB] Could not parse existing DB file, initializing fresh:', e.message);
    }
    if (!data) {
      data = JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    // Ensure default demo users exist
    if (!data.users) data.users = [];
    for (const u of DEFAULT_SEEDED_USERS) {
      const existing = data.users.find(x => x.email === u.email);
      if (!existing) {
        data.users.push(u);
      } else if (!existing.passwordHash.startsWith('$2b$')) {
        existing.passwordHash = u.passwordHash;
      }
    }

    this._saveSync(data);
    return data;
  }

  _saveSync(data) {
    try {
      const tmpFile = `${this.dbFile}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpFile, this.dbFile);
    } catch (e) {
      console.error('[DB] Save error:', e.message);
    }
  }

  async persist() {
    return new Promise((resolve) => {
      this.writeQueue = this.writeQueue.then(async () => {
        try {
          const tmpFile = `${this.dbFile}.${Date.now()}.tmp`;
          await fs.promises.writeFile(tmpFile, JSON.stringify(this.memoryData, null, 2), 'utf8');
          await fs.promises.rename(tmpFile, this.dbFile);
        } catch (e) {
          console.error('[DB] Async persist error:', e.message);
        }
        resolve();
      });
    });
  }

  getCollection(name) {
    if (!this.memoryData[name]) {
      this.memoryData[name] = [];
    }
    const data = this.memoryData[name];

    return {
      find: async (filter = {}) => {
        if (typeof filter === 'function') {
          return data.filter(filter);
        }
        return data.filter(item => {
          return Object.keys(filter).every(key => {
            if (filter[key] instanceof RegExp) {
              return filter[key].test(item[key]);
            }
            return item[key] === filter[key];
          });
        });
      },

      findOne: async (filter = {}) => {
        if (typeof filter === 'function') {
          return data.find(filter) || null;
        }
        return data.find(item => {
          return Object.keys(filter).every(key => {
            if (filter[key] instanceof RegExp) {
              return filter[key].test(item[key]);
            }
            return item[key] === filter[key];
          });
        }) || null;
      },

      findById: async (id) => {
        return data.find(item => item.id === id || item._id === id) || null;
      },

      insert: async (doc) => {
        const id = doc.id || doc._id || `id_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const newDoc = {
          ...doc,
          id,
          _id: id,
          createdAt: doc.createdAt || new Date().toISOString()
        };
        data.push(newDoc);
        await this.persist();
        return newDoc;
      },

      update: async (id, updates) => {
        const index = data.findIndex(item => item.id === id || item._id === id);
        if (index === -1) return null;
        data[index] = {
          ...data[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await this.persist();
        return data[index];
      },

      updateMany: async (filter, updates) => {
        let count = 0;
        for (let i = 0; i < data.length; i++) {
          let match = false;
          if (typeof filter === 'function') {
            match = filter(data[i]);
          } else {
            match = Object.keys(filter).every(k => data[i][k] === filter[k]);
          }
          if (match) {
            data[i] = { ...data[i], ...updates, updatedAt: new Date().toISOString() };
            count++;
          }
        }
        if (count > 0) await this.persist();
        return { modifiedCount: count };
      },

      remove: async (id) => {
        const index = data.findIndex(item => item.id === id || item._id === id);
        if (index === -1) return false;
        data.splice(index, 1);
        await this.persist();
        return true;
      },

      removeMany: async (filter) => {
        let count = 0;
        for (let i = data.length - 1; i >= 0; i--) {
          let match = false;
          if (typeof filter === 'function') {
            match = filter(data[i]);
          } else {
            match = Object.keys(filter).every(k => data[i][k] === filter[k]);
          }
          if (match) {
            data.splice(i, 1);
            count++;
          }
        }
        if (count > 0) await this.persist();
        return { deletedCount: count };
      }
    };
  }
}

const db = new Database();

module.exports = {
  db,
  users: db.getCollection('users'),
  otps: db.getCollection('otps'),
  contacts: db.getCollection('contacts'),
  invitations: db.getCollection('invitations'),
  journeys: db.getCollection('journeys'),
  journeyEvents: db.getCollection('journeyEvents'),
  escalations: db.getCollection('escalations'),
  checkIns: db.getCollection('checkIns'),
  auditLogs: db.getCollection('auditLogs')
};
