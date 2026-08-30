# KathaGPT - AI Chat Bot Setup Guide

## 🚀 Local Setup Instructions

### Step 1: Install Node.js
- Download Node.js from https://nodejs.org/ (LTS version)
- Install it on your computer

### Step 2: Clone Repository
```bash
git clone https://github.com/li7906766639-jpg/Ai-chat-app.git
cd Ai-chat-app
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Environment Variables
1. Copy `.env.example` to `.env`
2. Open `.env` file
3. Replace `your_api_key_here` with your OpenAI API key
```
OPENAI_API_KEY=sk-proj-xxxxx
PORT=3000
```

### Step 5: Start Server
```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ Ready to accept chat requests!
```

### Step 6: Open Chat App
1. Open browser
2. Go to `http://localhost:3000`
3. Start chatting! 🎉

## 📝 Important Notes
- **Never share your API key publicly**
- `.env` file is ignored by git (protected)
- Server must be running for chat to work

## ❓ Troubleshooting
- **"Module not found"** → Run `npm install` again
- **"Port already in use"** → Change PORT in .env to 5000 or 8000
- **"API key error"** → Check your OpenAI API key is correct
