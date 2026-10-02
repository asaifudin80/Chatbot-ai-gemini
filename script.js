// =========================================================
// Chatbot AI dengan Google Gemini API
// Menggunakan endpoint OpenAI-compatible dari Gemini,
// jadi struktur kode hampir sama dengan versi OpenAI.
// ⚠️ JANGAN commit API key ke GitHub — masukkan lewat menu ⚙️
// =========================================================

const chatBox     = document.getElementById("chat-box");
const chatForm    = document.getElementById("chat-form");
const userInput   = document.getElementById("user-input");
const sendBtn     = document.getElementById("send-btn");
const modal       = document.getElementById("api-modal");
const settingsBtn = document.getElementById("settings-btn");

// Endpoint Gemini yang kompatibel dengan format OpenAI
const API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Riwayat percakapan
let messages = [
  {
    role: "system",
    content:
      "Kamu adalah asisten AI yang ramah dan membantu. Jawab dalam Bahasa Indonesia " +
      "kecuali pengguna meminta bahasa lain. Jawaban panjang, jelas, dan to the point.",
  },
];

// ---------- API KEY ----------
function getApiKey() { return localStorage.getItem("gemini_api_key") || ""; }
function getModel()  { return localStorage.getItem("gemini_model") || "gemini-3.5-flash"; }
function hasApiKey() { return getApiKey().length > 10; }

function openModal() {
  document.getElementById("api-key-input").value = getApiKey();
  document.getElementById("model-select").value = getModel();
  modal.classList.add("show");
}
function closeModal() { modal.classList.remove("show"); }

document.getElementById("save-api-btn").addEventListener("click", () => {
  const key = document.getElementById("api-key-input").value.trim();
  const model = document.getElementById("model-select").value;
  if (key) {
    localStorage.setItem("gemini_api_key", key);
    localStorage.setItem("gemini_model", model);
    addMessage("✅ API Key Gemini tersimpan! Silakan ngobrol. 🎉", "bot");
  }
  closeModal();
});

settingsBtn.addEventListener("click", openModal);
document.getElementById("close-modal-btn").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// ---------- TAMPILAN ----------
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text,photo,video,link,dokumen;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const t = document.createElement("div");
  t.className = "typing";
  t.id = "typing";
  t.innerHTML = "<span></span><span></span><span></span>";
  chatBox.appendChild(t);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function hideTyping() {
  const t = document.getElementById("typing");
  if (t) t.remove();
}

// ---------- KONEKSI GEMINI ----------
async function askGemini(userText) {
  messages.push({ role: "user", content: userText });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const reply = data.choices[0].message.content;
  messages.push({ role: "assistant", content: reply });
  return reply;
}

// ---------- EVENT ----------
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  if (!hasApiKey()) {
    addMessage("⚠️ Kamu belum mengatur API Key. Klik tombol ⚙️ di kanan bawah dulu, ya!", "bot");
    openModal();
    return;
  }

  addMessage(text, "user");
  userInput.value = "";
  sendBtn.disabled = true;
  showTyping();

  try {
    const reply = await askGemini(text);
    hideTyping();
    addMessage(reply, "bot");
  } catch (err) {
    hideTyping();
    addMessage("❌ " + err.message, "error");
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
});

// Pesan pembuka
window.addEventListener("load", () => {
  addMessage(
    "Halo! 👋 Saya chatbot berbasis Google Gemini. " +
    (hasApiKey() ? "Silakan bertanya apa saja!" : "Klik tombol ⚙️ untuk mengatur API Key kamu dulu."),
    "bot"
  );
  if (!hasApiKey()) openModal();
});
