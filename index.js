require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Tutor = require("./models/Tutor");
const cors = require("cors");
const nlp = require("compromise");
const chrono = require("chrono-node");

// const { OpenAI } = require("openai");

// const openai = new OpenAI({
//   api_key: process.env.OPENAI_API_KEY,
// });

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB is now connected!");
    app.listen(process.env.port, () => {
      console.log(`Listening to requests on port ${process.env.port}`);
    });
  })
  .catch((e) => console.log(e));
// api route
app.post("/set-availability", async (req, res) => {
  const { tutorId, availability } = req.body;
  const parsedAvailability = availability;
  inputParser(availability);

  try {
    await Tutor.findOneAndUpdate(
      { tutorId },
      { availability: parsedAvailability },
      { upsert: true, new: true }
    );
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

async function inputParser(availability) {
  const doc = nlp(availability);
  const timeslots = [];

  // Define patterns for days and times
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const relativeDays = {
    weekends: ["Friday", "Saturday"],
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  };

  const timeRanges = chrono.parse(availability);
  const dayPatterns = doc
    .match(
      "(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekends|weekdays|otherwise)"
    )
    .out("array");

  function normalizeTime(time) {
    const parsedTime = chrono.parse(time);
    if (parsedTime.length > 0) {
      const { start, end } = parsedTime[0];
      const startTime = start
        .date()
        .toISOString()
        .split("T")[1]
        .substring(0, 5);
      const endTime = end
        ? end.date().toISOString().split("T")[1].substring(0, 5)
        : null;
      return { startTime, endTime };
    }
    return { startTime: null, endTime: null };
  }

  const mentionedDays = new Set();
  timeRanges.forEach((range) => {
    const { startTime, endTime } = normalizeTime(range.text);

    dayPatterns.forEach((dayPattern) => {
      if (daysOfWeek.includes(dayPattern)) {
        timeslots.push({ day: dayPattern, startTime, endTime });
        mentionedDays.add(dayPattern);
      } else if (relativeDays[dayPattern]) {
        relativeDays[dayPattern].forEach((day) => {
          timeslots.push({ day, startTime, endTime });
          mentionedDays.add(day);
        });
      }
    });
  });

  if (dayPatterns.includes("otherwise")) {
    const otherwiseDays = daysOfWeek.filter((day) => !mentionedDays.has(day));
    timeRanges.forEach((range) => {
      const { startTime, endTime } = normalizeTime(range.text);
      otherwiseDays.forEach((day) => {
        timeslots.push({ day, startTime, endTime });
      });
    });
  }

  console.log(timeslots);
  return timeslots;
}
