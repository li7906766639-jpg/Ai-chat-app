const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Debug logging
console.log('Environment Check:');
console.log('API Key Present:', !!OPENAI_API_KEY);
console.log('API Key Length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Serve HTML on root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KathaGPT - AI Chat</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px;
        }
        .container {
          width: 100%;
          max-width: 500px;
          height: 90vh;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .message {
          padding: 12px 15px;
          border-radius: 10px;
          max-width: 85%;
          word-wrap: break-word;
          animation: fadeIn 0.3s ease-in;
          line-height: 1.4;
          font-size: 14px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .user-message {
          align-self: flex-end;
          background: #667eea;
          color: white;
          border-radius: 15px 15px 0 15px;
        }
        .bot-message {
          align-self: flex-start;
          background: #f0f0f0;
          color: #333;
          border-radius: 15px 15px 15px 0;
        }
        .error-message {
          background: #ffebee;
          color: #c62828;
          border-left: 4px solid #c62828;
        }
        .input-area {
          display: flex;
          padding: 15px;
          gap: 10px;
          border-top: 1px solid #e0e0e0;
          background: #f9f9f9;
        }
        input {
          flex: 1;
          border: 2px solid #ddd;
          border-radius: 25px;
          padding: 12px 20px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
          font-family: inherit;
        }
        input:focus {
          border-color: #667eea;
        }
        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
          flex-shrink: 0;
          padding: 0;
        }
        button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
        }
        button:active:not(:disabled) {
          transform: scale(0.95);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #667eea;
          animation: bounce 1.4s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">🤖 KathaGPT</div>
        <div class="messages" id="messages"></div>
        <div class="input-area">
          <input type="text" id="input" placeholder="Type your message..." autocomplete="off">
          <button id="sendBtn" onclick="sendMessage()">➤</button>
        </div>
      </div>

      <script>
        const messagesDiv = document.getElementById('messages');
        const inputField = document.getElementById('input');
        const sendBtn = document.getElementById('sendBtn');

        function addMessage(text, isUser, isError = false) {
          const msgEl = document.createElement('div');
          let className = 'message ';
          if (isError) {
            className += 'bot-message error-message';
          } else {
            className += isUser ? 'user-message' : 'bot-message';
          }
          msgEl.className = className;
          msgEl.textContent = text;
          messagesDiv.appendChild(msgEl);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function showLoading() {
          const msgEl = document.createElement('div');
          msgEl.className = 'message bot-message loading';
          msgEl.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
          msgEl.id = 'loading';
          messagesDiv.appendChild(msgEl);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function removeLoading() {
          const loading = document.getElementById('loading');
          if (loading) loading.remove();
        }

        async function sendMessage() {
          const text = inputField.value.trim();
          if (!text || sendBtn.disabled) return;

          sendBtn.disabled = true;
          addMessage(text, true);
          inputField.value = '';
          showLoading();

          try {
            const response = await fetch('/chat', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: [{ role: 'user', content: text }],
                model: 'gpt-3.5-turbo'
              })
            });

            const data = await response.json();
            removeLoading();

            if (response.ok && data.choices && data.choices[0]?.message?.content) {
              addMessage(data.choices[0].message.content, false);
            } else {
              const errorMsg = data.error?.message || 'Failed to get response';
              addMessage('Error: ' + errorMsg, false, true);
            }
          } catch (error) {
            removeLoading();
            addMessage('Connection error: ' + error.message, false, true);
          } finally {
            sendBtn.disabled = false;
            inputField.focus();
          }
        }

        inputField.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !sendBtn.disabled) {
            sendMessage();
          }
        });

        addMessage('Hi! I am KathaGPT. How can I help you today? 😊', false);
        inputField.focus();
      </script>
    </body>
    </html>
  `);
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'Invalid messages format' } });
    }

    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      console.error('API Key not configured!');
      return res.status(500).json({ error: { message: 'Server not properly configured. API key missing.' } });
    }

    console.log('Calling OpenAI API...');
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': \`Bearer \${OPENAI_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('OpenAI API response successful');
    res.json(response.data);

  } catch (error) {
    console.error('Chat Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'Server error occurred';

    res.status(error.response?.status || 500).json({ 
      error: { message: errorMessage }
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    apiKeyConfigured: !!OPENAI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`✅ API Key configured: \${!!OPENAI_API_KEY}\`);
});

module.exports = app;
