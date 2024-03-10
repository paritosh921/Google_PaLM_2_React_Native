const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.LANGUAGE_MODEL_API_KEY; // Make sure this matches your .env variable
const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize the chat
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
let chat;

app.post('/start-chat', async (req, res) => {
  chat = model.startChat({
    generationConfig: {
      maxOutputTokens: 5000,
    },
  });
  res.json({ message: 'Chat started' });
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!chat) {
    return res.status(400).json({ error: 'Chat not initialized' });
  }

  const result = await chat.sendMessage(message);
  const response = await result.response;

  try {
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating the response' });
  }
});

const serverIp = '0.0.0.0'; // Listen on all available network interfaces
app.listen(PORT, serverIp, () => console.log(`Server running at http://${serverIp}:${PORT}/`));
