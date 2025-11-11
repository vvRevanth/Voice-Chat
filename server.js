// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // load .env

const app = express();
app.use(express.static("public")); // serve index.html from public folder
app.use(express.json());

// ---- OpenRouter chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("📩 User message:", userMessage);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are ChatGPT, a helpful and intelligent assistant." },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await response.json();
    console.log("🧠 OpenRouter raw response:", data);

    if (data.choices && data.choices[0]?.message?.content) {
      res.json({ reply: data.choices[0].message.content });
    } else if (data.error) {
      res.json({ reply: `⚠️ OpenRouter error: ${data.error.message}` });
    } else {
      res.json({ reply: "⚠️ AI did not return a valid response." });
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ reply: "⚠️ Server error. Check console logs." });
  }
});

// ---- Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));