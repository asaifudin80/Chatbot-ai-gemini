document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const fileInput = document.getElementById('file-input');
  const filePreview = document.getElementById('file-preview');

  // LOGIN STATE
  let user = JSON.parse(localStorage.getItem('user_login') || 'null');
  let allChats = JSON.parse(localStorage.getItem('all_chats') || '{}');
  let currentChatId = localStorage.getItem('current_chat_id') || Date.now().toString();
  if(!allChats[currentChatId]) allChats[currentChatId] = [];
  let selectedFile = null;
  let apiKeys = JSON.parse(localStorage.getItem('gemini_keys') || '[]');
  let activeKeyMode = localStorage.getItem('active_key_mode') || 'auto';
  let currentKeyIndex = 0;

  function updateLoginUI(){
    const profile = document.getElementById('user-profile');
    const loginBtn = document.getElementById('login-open-btn');
    const status = document.getElementById('user-status');
    if(user){
      profile.style.display='flex';
      loginBtn.style.display='none';
      document.getElementById('user-email-display').innerText = user.name || user.email;
      status.innerText = user.email + ' • ' + Object.keys(allChats).length + ' chat tersimpan';
    } else {
      profile.style.display='none';
      loginBtn.style.display='block';
      status.innerText = 'Silakan login biar chat kesimpan';
    }
  }
  updateLoginUI();

  // Sidebar toggle
  document.getElementById('open-sidebar').onclick = () => sidebar.classList.add('open');
  document.getElementById('close-sidebar').onclick = () => sidebar.classList.remove('open');

  // Login modal
  const loginModal = document.getElementById('login-modal');
  document.getElementById('login-open-btn').onclick = () => loginModal.style.display='flex';
  document.getElementById('login-close-btn').onclick = () => loginModal.style.display='none';
  document.getElementById('login-submit-btn').onclick = () => {
    const email = document.getElementById('login-email').value.trim();
    const name = document.getElementById('login-name').value.trim() || email.split('@')[0];
    if(!email.includes('@')) return alert('Email tidak valid!');
    user = {email, name};
    localStorage.setItem('user_login', JSON.stringify(user));
    loginModal.style.display='none';
    updateLoginUI();
  };
  document.getElementById('logout-btn').onclick = () => {
    if(confirm('Logout?')){ localStorage.removeItem('user_login'); user=null; updateLoginUI(); }
  };

  // API modal
  const apiModal = document.getElementById('api-modal');
  document.getElementById('settings-open-btn').onclick = () => apiModal.style.display='flex';
  document.getElementById('close-modal-btn').onclick = () => apiModal.style.display='none';
  document.getElementById('save-api-btn').onclick = () => {
    const k1 = document.getElementById('api-key-1').value.trim();
    if(!k1) return alert('Key 1 wajib!');
    apiKeys = [k1, document.getElementById('api-key-2').value.trim(), document.getElementById('api-key-3').value.trim()].filter(k=>k);
    localStorage.setItem('gemini_keys', JSON.stringify(apiKeys));
    localStorage.setItem('active_key_mode', document.getElementById('api-key-select').value);
    localStorage.setItem('gemini_model', document.getElementById('model-select').value);
    apiModal.style.display='none';
  };
  if(apiKeys.length===0) apiModal.style.display='flex';

  // Chat logic (sama kayak sebelumnya tapi pakai sidebar)
  function saveAll(){ localStorage.setItem('all_chats', JSON.stringify(allChats)); localStorage.setItem('current_chat_id', currentChatId); renderSidebar(); }
  function renderSidebar(){
    const list = document.getElementById('chat-list-sidebar'); list.innerHTML='';
    Object.keys(allChats).reverse().forEach(id => {
      const first = allChats[id][0]?.text || 'Chat Baru';
      const div = document.createElement('div'); div.className='chat-item' + (id===currentChatId?' active':'');
      div.innerHTML = `<span>${first.substring(0,25)}</span><small data-del="${id}" style="color:#ff5555;">✕</small>`;
      div.onclick = (e)=>{ if(!e.target.dataset.del){ loadChat(id); if(window.innerWidth<768) sidebar.classList.remove('open'); } };
      list.appendChild(div);
    });
    list.querySelectorAll('[data-del]').forEach(b=> b.onclick=(e)=>{ e.stopPropagation(); delete allChats[b.dataset.del]; if(b.dataset.del===currentChatId){ currentChatId=Date.now().toString(); allChats[currentChatId]=[]; } saveAll(); loadChat(currentChatId); });
  }
  function loadChat(id){ currentChatId=id; chatBox.innerHTML=''; (allChats[id]||[]).forEach(m=>renderMsg(m.text, m.sender, m.fileUrl, false)); document.getElementById('current-chat-title').innerText = allChats[id][0]?.text?.substring(0,20) || 'Chat Baru'; saveAll(); }
  function renderMsg(text, sender, fileUrl, save=true){
    const div=document.createElement('div'); div.className=`message ${sender}`; div.innerText=text;
    if(fileUrl) div.innerHTML+=`<img src="${fileUrl}">`;
    chatBox.appendChild(div); chatBox.scrollTop=chatBox.scrollHeight;
    if(save){ allChats[currentChatId].push({text,sender,fileUrl}); saveAll(); } return div;
  }
  renderSidebar(); loadChat(currentChatId);

  document.getElementById('new-chat-sidebar').onclick = () => { currentChatId=Date.now().toString(); allChats[currentChatId]=[]; chatBox.innerHTML=''; document.getElementById('current-chat-title').innerText='Chat Baru'; saveAll(); sidebar.classList.remove('open'); };
  document.getElementById('clear-btn').onclick = () => { if(confirm('Hapus chat ini?')){ allChats[currentChatId]=[]; chatBox.innerHTML=''; saveAll(); } };

  // File + Kirim
  fileInput.onchange = async (e)=>{ const file=e.target.files[0]; if(!file) return; const b64=await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(file); }); selectedFile={base64:b64.split(',')[1], mimeType:file.type, preview:b64}; filePreview.innerHTML=`<img src="${b64}" style="width:50px"><span>${file.name}</span>`; filePreview.classList.add('active'); };
  window.removeFile=()=>{ selectedFile=null; filePreview.classList.remove('active'); };
  function getKey(){ return activeKeyMode==='auto'? apiKeys[currentKeyIndex%apiKeys.length] : apiKeys[parseInt(activeKeyMode)]||apiKeys[0]; }

  chatForm.addEventListener('submit', async (e)=>{
    e.preventDefault(); if(!user) return alert('Login dulu pakai email biar chat kesimpan!'), loginModal.style.display='flex';
    const text=userInput.value.trim(); if(!text &&!selectedFile) return;
    const fileToSend=selectedFile; renderMsg(text,'user',fileToSend?.preview,true); userInput.value=''; filePreview.classList.remove('active'); selectedFile=null;
    const loading=renderMsg('...','bot',null,false);
    const model=localStorage.getItem('gemini_model')||'gemini-2.0-flash';
    const parts=[]; if(text) parts.push({text}); if(fileToSend) parts.push({inlineData:{mimeType:fileToSend.mimeType, data:fileToSend.base64}});
    for(let i=0;i<apiKeys.length;i++){ try{ const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${getKey()}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts}]})}); const data=await res.json(); loading.remove(); if(data.candidates){ renderMsg(data.candidates[0].content.parts[0].text,'bot',null,true); return; } else currentKeyIndex++; }catch{ currentKeyIndex++; } }
    loading.remove(); renderMsg('❌ Key limit / error','bot',null,true);
  });
});
