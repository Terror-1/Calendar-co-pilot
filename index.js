require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Tutor = require("./models/Tutor");
const nlp = require("compromise");

const app = express();
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB is now connected!");
    // Starting server
    app.listen(process.env.port, () => {
      console.log(`Listening to requests on port ${process.env.port}`);
    });
  })
  .catch((e) => console.log(e));

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
function inputParser(availability) {
  const doc = nlp(availability);
  console.log(doc);
}
