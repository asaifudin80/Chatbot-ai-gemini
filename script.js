const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

const modal = document.getElementById('api-modal');
const settingsBtn = document.getElementById('settings-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveApiBtn = document.getElementById('save-api-btn');

let apiKeys = JSON.parse(localStorage.getItem('gemini_keys') || '[]');
let activeKeyMode = localStorage.getItem('active_key_mode') || 'auto';
let currentKeyIndex = 0;

// buka modal
settingsBtn.onclick = () => modal.style.display = 'flex';
closeModalBtn.onclick = () => modal.style.display = 'none';
if(apiKeys.length === 0) modal.style.display = 'flex';

// load ke input
document.getElementById('api-key-1').value = apiKeys[0] || '';
document.getElementById('api-key-2').value = apiKeys[1] || '';
document.getElementById('api-key-3').value = apiKeys[2] || '';
document.getElementById('api-key-select').value = activeKeyMode;

saveApiBtn.onclick = () => {
  const k1 = document.getElementById('api-key-1').value.trim();
  const k2 = document.getElementById('api-key-2').value.trim();
  const k3 = document.getElementById('api-key-3').value.trim();
  const mode = document.getElementById('api-key-select').value;

  if(!k1) return alert('Key 1 wajib diisi!');
  apiKeys = [k1, k2, k3].filter(k => k!== '');
  localStorage.setItem('gemini_keys', JSON.stringify(apiKeys));
  localStorage.setItem('active_key_mode', mode);
  localStorage.setItem('gemini_model', document.getElementById('model-select').value);
  activeKeyMode = mode;
  modal.style.display = 'none';
  alert('✅ API Key disimpan! Mode: ' + mode);
}

function getCurrentKey() {
  if(activeKeyMode === 'auto') {
    return apiKeys[currentKeyIndex % apiKeys.length];
  } else {
    return apiKeys[parseInt(activeKeyMode)] || apiKeys[0];
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if(!text) return;

  addMessage(text, 'user');
  userInput.value = '';

  const model = localStorage.getItem('gemini_model') || 'gemini-3.5-flash';

  for(let i=0; i<apiKeys.length; i++){
    try{
      const key = getCurrentKey();
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({contents:[{parts:[{text:text}]}]})
      });
      const data = await res.json();
      if(data.candidates){
        addMessage(data.candidates[0].content.parts[0].text, 'bot');
        return;
      } else {
        // limit habis, ganti key
        console.log('Key limit, ganti:', data);
        currentKeyIndex++;
      }
    }catch(err){ currentKeyIndex++; }
  }
  addMessage('❌ Semua API Key limit (20/hari). Coba ganti model ke gemini-3.5-flash atau tambah key baru di ⚙️', 'bot');
});

function addMessage(text, sender){
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

const modal = document.getElementById('api-modal');
const settingsBtn = document.getElementById('settings-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveApiBtn = document.getElementById('save-api-btn');

let apiKeys = JSON.parse(localStorage.getItem('gemini_keys') || '[]');
let activeKeyMode = localStorage.getItem('active_key_mode') || 'auto';
let currentKeyIndex = 0;

// buka modal
settingsBtn.onclick = () => modal.style.display = 'flex';
closeModalBtn.onclick = () => modal.style.display = 'none';
if(apiKeys.length === 0) modal.style.display = 'flex';

// load ke input
document.getElementById('api-key-1').value = apiKeys[0] || '';
document.getElementById('api-key-2').value = apiKeys[1] || '';
document.getElementById('api-key-3').value = apiKeys[2] || '';
document.getElementById('api-key-select').value = activeKeyMode;

saveApiBtn.onclick = () => {
  const k1 = document.getElementById('api-key-1').value.trim();
  const k2 = document.getElementById('api-key-2').value.trim();
  const k3 = document.getElementById('api-key-3').value.trim();
  const mode = document.getElementById('api-key-select').value;

  if(!k1) return alert('Key 1 wajib diisi!');
  apiKeys = [k1, k2, k3].filter(k => k!== '');
  localStorage.setItem('gemini_keys', JSON.stringify(apiKeys));
  localStorage.setItem('active_key_mode', mode);
  localStorage.setItem('gemini_model', document.getElementById('model-select').value);
  activeKeyMode = mode;
  modal.style.display = 'none';
  alert('✅ API Key disimpan! Mode: ' + mode);
}

function getCurrentKey() {
  if(activeKeyMode === 'auto') {
    return apiKeys[currentKeyIndex % apiKeys.length];
  } else {
    return apiKeys[parseInt(activeKeyMode)] || apiKeys[0];
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if(!text) return;

  addMessage(text, 'user');
  userInput.value = '';

  const model = localStorage.getItem('gemini_model') || 'gemini-3.5-flash';

  for(let i=0; i<apiKeys.length; i++){
    try{
      const key = getCurrentKey();
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({contents:[{parts:[{text:text}]}]})
      });
      const data = await res.json();
      if(data.candidates){
        addMessage(data.candidates[0].content.parts[0].text, 'bot');
        return;
      } else {
        // limit habis, ganti key
        console.log('Key limit, ganti:', data);
        currentKeyIndex++;
      }
    }catch(err){ currentKeyIndex++; }
  }
  addMessage('❌ Semua API Key limit (20/hari). Coba ganti model ke gemini-3.5-flash atau tambah key baru di ⚙️', 'bot');
});

function addMessage(text, sender){
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  }
