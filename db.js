const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://adityashinde24:8vM4yXI7cbovZDOy@cluster0.7mgbh7r.mongodb.net/college_marks';

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas!');
})
.catch((err) => {
  console.error('❌ Could not connect to MongoDB Atlas:', err);
});

// Define schemas
const parentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const teacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const markSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  subject_name: { type: String, required: true },
  exam_type: { type: String, required: true },
  marks: { type: Number, required: true },
  year: { type: String, required: true },
  division: { type: String, required: true },
  semester: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const Parent = mongoose.model('Parent', parentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Mark = mongoose.model('Mark', markSchema);

module.exports = { mongoose, Parent, Teacher, Mark };
