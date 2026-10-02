document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const fileInput = document.getElementById('file-input');
  const filePreview = document.getElementById('file-preview');
  const modal = document.getElementById('api-modal');

  let apiKeys = JSON.parse(localStorage.getItem('gemini_keys') || '[]');
  let activeKeyMode = localStorage.getItem('active_key_mode') || 'auto';
  let currentKeyIndex = 0;
  let selectedFile = null;

  // ===== SISTEM SIMPAN PESAN (GAK HILANG) =====
  let allChats = JSON.parse(localStorage.getItem('all_chats') || '{}'); // {id: [messages]}
  let currentChatId = localStorage.getItem('current_chat_id') || Date.now().toString();
  if(!allChats[currentChatId]) allChats[currentChatId] = [];

  // Tampilkan tombol tambah chat
  document.querySelector('.chat-header').innerHTML += `
    <div style="display:flex; gap:6px; margin-top:8px;">
      <button id="new-chat-btn" style="font-size:12px; padding:4px 8px; border-radius:12px; border:1px solid #333; background:#2a2a2a; color:#fff; cursor:pointer;">+ Chat Baru</button>
      <button id="save-export-btn" style="font-size:12px; padding:4px 8px; border-radius:12px; border:1px solid #333; background:#2a2a2a; color:#fff;">💾 Export</button>
      <button id="list-chat-btn" style="font-size:12px; padding:4px 8px; border-radius:12px; border:1px solid #333; background:#2a2a2a; color:#fff;">📂 Riwayat</button>
    </div>
    <div id="chat-list" style="display:none; margin-top:12px; max-height:120px; overflow-y:auto;"></div>
  `;

  function saveAll() {
    localStorage.setItem('all_chats', JSON.stringify(allChats));
    localStorage.setItem('current_chat_id', currentChatId);
  }

  function loadChat(id) {
    currentChatId = id;
    chatBox.innerHTML = '';
    (allChats[id] || []).forEach(m => renderMessage(m.text, m.sender, m.fileUrl, false));
    saveAll();
    document.getElementById('chat-list').style.display = 'none';
  }

  function renderChatList() {
    const listDiv = document.getElementById('chat-list');
    listDiv.innerHTML = '';
    Object.keys(allChats).reverse().forEach(id => {
      const firstText = allChats[id][0]?.text || 'Chat kosong';
      const item = document.createElement('div');
      item.style.cssText = 'padding:6px 8px; background:#2a2a2a; margin-bottom:4px; border-radius:6px; font-size:12px; cursor:pointer; display:flex; justify-content:space-between;';
      item.innerHTML = `<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${firstText.substring(0,30)}</span> <span data-del="${id}" style="color:#ff5555; cursor:pointer;">✕</span>`;
      item.onclick = (e) => { if(!e.target.dataset.del) loadChat(id); };
      listDiv.appendChild(item);
    });
    // hapus chat
    listDiv.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if(confirm('Hapus chat ini?')) {
          delete allChats[btn.dataset.del];
          if(btn.dataset.del === currentChatId) {
            currentChatId = Date.now().toString();
            allChats[currentChatId] = [];
          }
          saveAll(); renderChatList(); loadChat(currentChatId);
        }
      }
    });
  }

  // Load awal
  loadChat(currentChatId);

  document.getElementById('new-chat-btn').onclick = () => {
    currentChatId = Date.now().toString();
    allChats[currentChatId] = [];
    chatBox.innerHTML = '';
    saveAll(); renderChatList();
  };
  document.getElementById('list-chat-btn').onclick = () => {
    const el = document.getElementById('chat-list');
    el.style.display = el.style.display === 'none'? 'block' : 'none';
    renderChatList();
  };
  document.getElementById('save-export-btn').onclick = () => {
    const blob = new Blob([JSON.stringify(allChats, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='chat-backup.json'; a.click();
  };
  document.getElementById('clear-btn').onclick = () => {
    if(confirm('Hapus semua pesan di chat ini?')) {
      allChats[currentChatId] = [];
      chatBox.innerHTML = ''; saveAll();
    }
  };

  // ===== SISA LOGIC SAMA SEPERTI KEMARIN =====
  const settingsBtn = document.getElementById('settings-btn');
  settingsBtn.onclick = () => modal.style.display='flex';
  document.getElementById('close-modal-btn').onclick = () => modal.style.display='none';
  if(apiKeys.length===0) modal.style.display='flex';

  document.getElementById('save-api-btn').onclick = () => {
    const k1 = document.getElementById('api-key-1').value.trim();
    if(!k1) return alert('Key 1 wajib!');
    apiKeys = [k1, document.getElementById('api-key-2').value.trim(), document.getElementById('api-key-3').value.trim()].filter(k=>k);
    localStorage.setItem('gemini_keys', JSON.stringify(apiKeys));
    localStorage.setItem('active_key_mode', document.getElementById('api-key-select').value);
    localStorage.setItem('gemini_model', document.getElementById('model-select').value);
    activeKeyMode = document.getElementById('api-key-select').value;
    modal.style.display='none';
  };

  fileInput.onchange = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    const base64 = await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(file); });
    selectedFile = { base64: base64.split(',')[1], mimeType: file.type, name: file.name, preview: base64 };
    filePreview.innerHTML = `<img src="${base64}" style="width:50px; border-radius:6px;"><span style="font-size:12px; color:#ccc;">${file.name}</span> <button onclick="removeFile()" style="background:#ff4444; border:none; color:#fff; border-radius:50%; width:20px; height:20px;">✕</button>`;
    filePreview.classList.add('active');
  };
  window.removeFile = () => { selectedFile=null; fileInput.value=''; filePreview.classList.remove('active'); filePreview.innerHTML=''; };
  function getKey(){ return activeKeyMode==='auto'? apiKeys[currentKeyIndex%apiKeys.length] : apiKeys[parseInt(activeKeyMode)]||apiKeys[0]; }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if(!text &&!selectedFile) return;
    const fileToSend = selectedFile;
    renderMessage(text, 'user', fileToSend?.preview, true, fileToSend?.name);
    userInput.value=''; window.removeFile();
    const loading = renderMessage('...', 'bot', null, false);
    const model = localStorage.getItem('gemini_model') || 'gemini-2.0-flash';
    const parts = []; if(text) parts.push({text}); if(fileToSend) parts.push({inlineData:{mimeType:fileToSend.mimeType, data:fileToSend.base64}});
    for(let i=0;i<apiKeys.length;i++){
      try{
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${getKey()}`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({contents:[{parts}]})});
        const data = await res.json(); loading.remove();
        if(data.candidates){ renderMessage(data.candidates[0].content.parts[0].text, 'bot', null, true); return; }
        else currentKeyIndex++;
      }catch{ currentKeyIndex++; }
    }
    loading.remove(); renderMessage('❌ Limit, ganti key di ⚙️', 'bot', null, true);
  });

  function renderMessage(text, sender, fileUrl, save=true){
    const div = document.createElement('div'); div.className=`message ${sender}`; div.innerText=text;
    if(fileUrl) div.innerHTML += `<img src="${fileUrl}" style="max-width:200px; border-radius:10px; margin-top:8px; display:block;">`;
    chatBox.appendChild(div); chatBox.scrollTop = chatBox.scrollHeight;
    if(save){ allChats[currentChatId].push({text, sender, fileUrl, time: Date.now()}); saveAll(); }
    return div;
  }
});
