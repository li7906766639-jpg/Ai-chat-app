const chat = document.getElementById("chat");
const prompt = document.getElementById("prompt");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", async () => {
  const text = prompt.value.trim();
  if (!text) return;

  chat.innerHTML += `<div class="user">${text}</div>`;
  prompt.value = "";

  try {
    const response = await fetch("https://red-sky-7adc.li7906766639.workers.dev


", {
      method: "POST",
      headers: {
  
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: /gpt-4o-mini
        messages: [
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response.";

    chat.innerHTML += `<div class="ai">${reply}</div>`;
    chat.scrollTop = chat.scrollHeight;

  } catch (err) {
    chat.innerHTML += `<div class="ai">Error: ${err.message}</div>`;
  }
});
