require('dotenv').config();

module.exports = {
  'development': {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Use only if you don't have a trusted certificate
      }
    }
  },
  'test': {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Use only if you don't have a trusted certificate
      }
    }
  },
  'production': {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Use only if you don't have a trusted certificate
      }
    }
  }
}
