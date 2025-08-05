const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const db = require("../db");

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload marks route
router.post("/upload-marks", upload.single("marksFile"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("❌ No file uploaded.");

  const fileExt = path.extname(file.originalname).toLowerCase();

  const insertIntoDatabase = (data) => {
    data.forEach((row) => {
      const {
        student_id,
        subject_name,
        exam_type,
        marks,
        year,
        division,
        semester
      } = row;

      db.query(
        `INSERT INTO marks (student_id, subject_name, exam_type, marks, year, division, semester)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [student_id, subject_name, exam_type, marks, year, division, semester],
        (err, result) => {
          if (err) {
            console.error("❌ Error inserting:", err);
            console.log("🚨 Row failed:", row);
          } else {
            console.log("✅ Inserted:", row);
          }
        }
      );
    });
  };

  if (fileExt === ".csv") {
    const results = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        insertIntoDatabase(results);
        fs.unlinkSync(file.path);
        res.send("✅ CSV uploaded and marks inserted.");
      });
  } else if (fileExt === ".xlsx") {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    insertIntoDatabase(data);
    fs.unlinkSync(file.path);
    res.send("✅ Excel uploaded and marks inserted.");
  } else {
    fs.unlinkSync(file.path);
    res.status(400).send("❌ Unsupported file type.");
  }
});

module.exports = router;
