const {Pool} = require('pg')
require('dotenv').config()

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT 
// })

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use DATABASE_URL
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Enable SSL in production only
  });

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
      console.error('Error acquiring client', err.stack);
  } else {
      console.log('Database connected successfully!');
      client.query('SELECT NOW()', (err, result) => {
          release(); 
          if (err) {
              console.error('Error executing query', err.stack);
          } else {
              console.log('Database time:', result.rows[0]);
          }
      });
  }
});

module.exports = {pool}