const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'markuser',
  password: 'ADItya07',
  database: 'college_marks'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Could not connect to MySQL:', err);
  } else {
    console.log('✅ Connected to MySQL!');
  }
});

module.exports = db;  // <-- export the connection here
