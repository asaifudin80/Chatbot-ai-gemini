document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const fileInput = document.getElementById('file-input');
  const filePreview = document.getElementById('file-preview');
  const modal = document.getElementById('api-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const saveApiBtn = document.getElementById('save-api-btn');
  const clearBtn = document.getElementById('clear-btn');

  let apiKeys = JSON.parse(localStorage.getItem('gemini_keys') || '[]');
  let activeKeyMode = localStorage.getItem('active_key_mode') || 'auto';
  let currentKeyIndex = 0;
  let selectedFile = null; // {base64, mimeType, name}

  // LOAD CHAT TERSIMPAN
  let chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
  chatHistory.forEach(m => renderMessage(m.text, m.sender, m.fileUrl, false));

  function saveChat() { localStorage.setItem('chat_history', JSON.stringify(chatHistory)); }

  // Modal
  const openModal = () => { modal.style.display='flex';
    document.getElementById('api-key-1').value = apiKeys[0]||'';
    document.getElementById('api-key-2').value = apiKeys[1]||'';
    document.getElementById('api-key-3').value = apiKeys[2]||'';
  };
  const closeModal = () => modal.style.display='none';
  settingsBtn.onclick = openModal;
  closeModalBtn.onclick = closeModal;
  if(apiKeys.length===0) openModal();

  saveApiBtn.onclick = () => {
    const k1 = document.getElementById('api-key-1').value.trim();
    const k2 = document.getElementById('api-key-2').value.trim();
    const k3 = document.getElementById('api-key-3').value.trim();
    if(!k1) return alert('Key 1 wajib!');
    apiKeys = [k1,k2,k3].filter(k=>k);
    localStorage.setItem('gemini_keys', JSON.stringify(apiKeys));
    localStorage.setItem('active_key_mode', document.getElementById('api-key-select').value);
    localStorage.setItem('gemini_model', document.getElementById('model-select').value);
    activeKeyMode = document.getElementById('api-key-select').value;
    closeModal();
  };

  clearBtn.onclick = () => {
    if(confirm('Hapus semua chat?')) { chatHistory=[]; saveChat(); chatBox.innerHTML=''; }
  };

  // UPLOAD FILE
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const base64 = await toBase64(file);
    selectedFile = { base64: base64.split(',')[1], mimeType: file.type, name: file.name, preview: base64 };

    filePreview.innerHTML = '';
    if(file.type.startsWith('image/')) filePreview.innerHTML += `<img src="${base64}">`;
    else if(file.type.startsWith('video/')) filePreview.innerHTML += `<video src="${base64}" muted></video>`;
    filePreview.innerHTML += `<div class="file-info">📄 ${file.name}<br>${(file.size/1024).toFixed(1)} KB</div><button class="remove-file" onclick="removeFile()">✕</button>`;
    filePreview.classList.add('active');
  };
  window.removeFile = () => { selectedFile=null; fileInput.value=''; filePreview.classList.remove('active'); filePreview.innerHTML=''; };

  function toBase64(file){ return new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(file); }); }
  function getKey(){ return activeKeyMode==='auto'? apiKeys[currentKeyIndex%apiKeys.length] : apiKeys[parseInt(activeKeyMode)]||apiKeys[0]; }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if(!text &&!selectedFile) return;

    const fileToSend = selectedFile;
    renderMessage(text, 'user', fileToSend?.preview, true, fileToSend?.name);
    userInput.value='';
    const loading = renderMessage('...', 'bot', null, false);

    const model = localStorage.getItem('gemini_model') || 'gemini-3.5-flash';
    const parts = [];
    if(text) parts.push({text:text});
    if(fileToSend) parts.push({inlineData:{mimeType:fileToSend.mimeType, data:fileToSend.base64}});

    window.removeFile();

    for(let i=0;i<apiKeys.length;i++){
      try{
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${getKey()}`,{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({contents:[{parts:parts}]})
        });
        const data = await res.json();
        loading.remove();
        if(data.candidates){
          renderMessage(data.candidates[0].content.parts[0].text, 'bot', null, true);
          return;
        } else currentKeyIndex++;
      }catch(err){ currentKeyIndex++; }
    }
    loading.remove();
    renderMessage('❌ Semua Key limit / file terlalu besar (max 20MB)', 'bot', null, true);
  });

  function renderMessage(text, sender, fileUrl, save, fileName){
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    if(fileUrl){
      if(fileUrl.startsWith('data:image')) div.innerHTML += `<img src="${fileUrl}">`;
      else if(fileUrl.startsWith('data:video')) div.innerHTML += `<video src="${fileUrl}" controls></video>`;
      else div.innerHTML += `<div class="file-box">📎 ${fileName||'File'}</div>`;
      if(text) div.childNodes[0].textContent = text; // keep text
    }
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    if(save){ chatHistory.push({text, sender, fileUrl}); saveChat(); }
    return div;
  }
});
