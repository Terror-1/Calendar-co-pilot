require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Tutor = require("./models/Tutor");
const cors = require("cors");
// const nlp = require("compromise");
// const chrono = require("chrono-node");

// const { OpenAI } = require("openai");

// const openai = new OpenAI({
//   api_key: process.env.OPENAI_API_KEY,
// });

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
app.post("/parse-availability", async (req, res) => {
  const { tutorId, availability } = req.body;
  const parsedAvailability = await inputParser(availability);
  if (parsedAvailability) {
    res.send({
      success: true,
      tutorId: tutorId,
      parsedAvailability: parsedAvailability,
    });
  } else {
    res
      .status(400)
      .send({ success: false, message: "Please enter valid availability" });
  }
});

app.post("/set-availability", async (req, res) => {
  const { tutorId, availability } = req.body;

  try {
    await Tutor.findOneAndUpdate(
      { tutorId },
      { availability },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

async function inputParser(availability) {
  const prompt = `Extract the availability schedule from the following text "${availability}" where weekends are Friday and Saturday and format it as an array of JSON objects, with this schema: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    }
  ] and in case it can't handle the prompt, return JSON with a null value`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const cleanedResponse = JSON.parse(
      text.replace("json", "").replace(/```/g, "").trim()
    );

    return cleanedResponse || null;
  } catch (error) {
    return null;
  }
}
