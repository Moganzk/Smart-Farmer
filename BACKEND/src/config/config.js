require('dotenv').config();

module.exports = {
  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // Max number of clients in the pool
    idleTimeoutMillis: 30000
  },

  // Server
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: '24h',
    saltRounds: 8 // Reduced from 10 for faster registration (still very secure)
  },

  // File Upload
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    supportedTypes: ['image/jpeg', 'image/png'],
    maxWidth: 1920,
    maxHeight: 1080
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // AI APIs
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      maxRetries: 3,
      timeout: 30000
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'GPT-4',
      maxRetries: 3,
      timeout: 30000
    }
  },

  // Storage
  storage: {
    maxUserStorage: 1024 * 1024 * 1024, // 1GB per user
    imageRetentionDays: 90,
    tempDir: './temp'
  },

  // Chat
  chat: {
    maxMessageLength: 1000,
    maxGroupSize: 100,
    maxGroupsPerUser: 10
  }
};