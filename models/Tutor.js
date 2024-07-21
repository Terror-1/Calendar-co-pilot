const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema({
  tutorId: { type: String, required: true, unique: true },
  availability: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Tutor", tutorSchema);
