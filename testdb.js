const mysql = require('mysql2');

console.log("🔄 Connecting to DB...");

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'markuser',
  password: 'ADItya07',
  database: 'college_marks'
});

conn.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit();
  } else {
    console.log('✅ Test DB Connected!');
  }
});
