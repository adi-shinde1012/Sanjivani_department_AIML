const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const db = require("./db");

const teacherRoutes = require("./routes/teacherRoutes");
const authRoutes = require("./authRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "uploadForm.html"));
});

app.get("/teacher-signup", (req, res) => {
  res.sendFile(path.join(__dirname, "teacherSignup.html"));
});

app.get("/parent-signup", (req, res) => {
  res.sendFile(path.join(__dirname, "parentSignup.html"));
});

app.get("/parentslogin", (req, res) => {
  res.sendFile(path.join(__dirname, "parentslogin.html"));
});

app.get("/parent-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "parentdashboard.html"));
});

app.get("/teacherlogin", (req, res) => {
  res.sendFile(path.join(__dirname, "teacherlogin.html"));
});

app.get("/teacher-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "teacherdashboard.html"));
});

app.use("/teacher", teacherRoutes);
app.use("/auth", authRoutes);

// ✅ Multer setup to support file + text fields
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ Upload route (CSV or Excel)
app.post('/upload', upload.single('marksFile'), (req, res) => {
  const file = req.file;
  const { year, semester, division } = req.body;

  console.log("📥 Form Data:", req.body);

  if (!file) return res.status(400).send('❌ No file uploaded.');
  if (!year || !semester || !division) {
    return res.status(400).send("❌ Year, semester and division must be selected.");
  }

  const fileExt = file.originalname.split('.').pop().toLowerCase();

  const insertWithMeta = (data) => {
    data.forEach((row) => {
      const student_id = row.student_id?.trim();
      const subject_name = row.subject_name?.trim();
      const exam_type = row.exam_type?.toUpperCase().trim();
      const marks = parseInt(row.marks) || 0;

      db.query(
        'INSERT INTO marks (student_id, subject_name, exam_type, marks, year, semester, division) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student_id, subject_name, exam_type, marks, year, semester, division.toUpperCase()],
        (err, result) => {
          if (err) {
            console.error('❌ Error inserting:', err);
            console.log("🚨 Row failed:", row);
          } else {
            console.log("✅ Inserted:", row);
          }
        }
      );
    });
  };

  if (fileExt === 'csv') {
    const results = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        insertWithMeta(results);
        fs.unlinkSync(file.path);
        res.send('✅ CSV uploaded and data inserted.');
      });
  } else if (fileExt === 'xlsx') {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    insertWithMeta(data);
    fs.unlinkSync(file.path);
    res.send('✅ Excel uploaded and data inserted.');
  } else {
    fs.unlinkSync(file.path);
    res.status(400).send('❌ Unsupported file type.');
  }
});

// ✅ API to fetch all marks (optional/debug)
app.get("/marks", (req, res) => {
  db.query("SELECT * FROM marks", (err, results) => {
    if (err) {
      console.error("❌ Error fetching marks:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ FINAL API: fetch marks by student ID + year + semester + division + exam_type
app.get("/marks/:student_id/:exam_type", (req, res) => {
  const student_id = req.params.student_id.trim();
  const exam_type = req.params.exam_type.toUpperCase().trim();
  const { year, semester, division } = req.query;

  if (!year || !semester || !division) {
    return res.status(400).json({ error: "Year, semester, and division are required." });
  }

  db.query(
    "SELECT subject_name, marks, exam_type FROM marks WHERE student_id = ? AND exam_type = ? AND year = ? AND semester = ? AND division = ?",
    [student_id, exam_type, year, semester, division.toUpperCase()],
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching marks by ID:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: `No marks found for ${exam_type}` });
      }

      res.json(results); // ✅ return as array, not inside `{ marks: ... }`
    }
  );
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
