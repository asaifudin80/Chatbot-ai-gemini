document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');

  const modal = document.getElementById('api-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const saveApiBtn = document.getElementById('save-api-btn');
  const modelSelect = document.getElementById('model-select');

  let apiKeys = JSON.parse(localStorage.getItem('gemini_keys') || '[]');
  let activeKeyMode = localStorage.getItem('active_key_mode') || 'auto';
  let currentKeyIndex = 0;

  // --- FIX TOMBOL GEAR ---
  function openModal() {
    modal.style.display = 'flex';
    document.getElementById('api-key-1').value = apiKeys[0] || '';
    document.getElementById('api-key-2').value = apiKeys[1] || '';
    document.getElementById('api-key-3').value = apiKeys[2] || '';
    document.getElementById('api-key-select').value = activeKeyMode;
    modelSelect.value = localStorage.getItem('gemini_model') || 'gemini-3.5-flash';
  }
  function closeModal() {
    modal.style.display = 'none';
  }

  settingsBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  // klik luar modal untuk tutup
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
  });

  // auto buka kalau belum ada key
  if(apiKeys.length === 0) openModal();

  saveApiBtn.addEventListener('click', () => {
    const k1 = document.getElementById('api-key-1').value.trim();
    const k2 = document.getElementById('api-key-2').value.trim();
    const k3 = document.getElementById('api-key-3').value.trim();
    const mode = document.getElementById('api-key-select').value;

    if(!k1) return alert('Key 1 wajib diisi!');
    apiKeys = [k1, k2, k3].filter(k => k!== '');
    localStorage.setItem('gemini_keys', JSON.stringify(apiKeys));
    localStorage.setItem('active_key_mode', mode);
    localStorage.setItem('gemini_model', modelSelect.value);
    activeKeyMode = mode;
    currentKeyIndex = 0;
    closeModal();
    addMessage(`✅ Key disimpan! Mode: ${mode} | Model: ${modelSelect.value}`, 'bot');
  });

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
    if(apiKeys.length === 0) return openModal();

    addMessage(text, 'user');
    userInput.value = '';
    const loading = addMessage('...mengetik', 'bot');

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
        loading.remove();
        if(data.candidates){
          addMessage(data.candidates[0].content.parts[0].text, 'bot');
          return;
        } else {
          console.log('Key error:', data);
          currentKeyIndex++;
        }
      }catch(err){
        console.log(err);
        currentKeyIndex++;
      }
    }
    loading.remove();
    addMessage('❌ Semua Key limit / error. Klik ⚙️ ganti key atau ganti model ke gemini-3.5-flash', 'bot');
  });

  function addMessage(text, sender){
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
  }
});
