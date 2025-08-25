const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'Emil',
  password: 'mYSQL#64',
  database: 'CharterWeb'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
});

module.exports = connection;
