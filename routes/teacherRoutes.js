const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const { Mark } = require("../db");

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload marks route
router.post("/upload-marks", upload.single("marksFile"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("❌ No file uploaded.");

  const fileExt = path.extname(file.originalname).toLowerCase();

  const insertIntoDatabase = async (data) => {
    try {
      const marksToInsert = data.map((row) => ({
        student_id: row.student_id,
        subject_name: row.subject_name,
        exam_type: row.exam_type,
        marks: parseInt(row.marks),
        year: row.year,
        division: row.division,
        semester: row.semester
      }));

      await Mark.insertMany(marksToInsert);
      console.log("✅ All marks inserted successfully");
    } catch (err) {
      console.error("❌ Error inserting marks:", err);
      throw err;
    }
  };

  try {
    if (fileExt === ".csv") {
      const results = [];
      fs.createReadStream(file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          await insertIntoDatabase(results);
          fs.unlinkSync(file.path);
          res.send("✅ CSV uploaded and marks inserted.");
        });
    } else if (fileExt === ".xlsx") {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      await insertIntoDatabase(data);
      fs.unlinkSync(file.path);
      res.send("✅ Excel uploaded and marks inserted.");
    } else {
      fs.unlinkSync(file.path);
      res.status(400).send("❌ Unsupported file type.");
    }
  } catch (err) {
    fs.unlinkSync(file.path);
    res.status(500).send("❌ Error processing file: " + err.message);
  }
});

module.exports = router;
