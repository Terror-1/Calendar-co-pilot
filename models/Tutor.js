const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema({
  tutorId: { type: String, required: true, unique: true },
  availability: { type: String },
});

module.exports = mongoose.model("Tutor", tutorSchema);
