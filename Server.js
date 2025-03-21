require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Check if required environment variables are set
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file.");
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is not defined in .env file.");
  process.exit(1);
}

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ OpenAI API Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Summarization Route
app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "❌ Text is required for summarization" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Summarize this text:" },
        { role: "user", content: text }
      ],
    });

    res.json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
