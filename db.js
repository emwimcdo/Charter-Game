// db.js
import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: process.env.DB_HOST,     // set in Render dashboard
  user: process.env.DB_USER,     // set in Render dashboard
  password: process.env.DB_PASS, // set in Render dashboard
  database: process.env.DB_NAME  // set in Render dashboard
});

// Optional: connect immediately and log errors
connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1); // Exit so Render marks the deploy as failed
  } else {
    console.log('Database connected.');
  }
});

export default connection;