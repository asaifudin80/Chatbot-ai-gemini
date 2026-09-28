# 🤖 Chatbot AI — Google Gemini

Chatbot web terhubung ke **Google Gemini API** — punya **FREE TIER** tanpa kartu kredit! 💳❌
Frontend murni HTML + CSS + JS, siap deploy di GitHub Pages.

![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JS](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Gemini](https://img.shields.io/badge/Gemini-API-4285F4)

## ✨ Fitur

- 💬 Percakapan AI sungguhan via Gemini (model gemini-2.5-flash)
- 🆓 **Free tier** — cukup daftar akun Google, tanpa kartu kredit
- 🔑 API Key dimasukkan lewat menu ⚙️ (tersimpan di `localStorage`, aman)
- 🧠 Memori percakapan (riwayat chat dikirim ke API)
- 📱 Responsif, tampilan modern

## 🔑 Cara Mendapatkan API Key (GRATIS)

1. Buka **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Login dengan akun Google
3. Klik **"Create API Key"** → copy key-nya (format `AIza...`)
4. Selesai! Tidak perlu kartu kredit, langsung ada kuota gratis per hari

## 🚀 Cara Menjalankan

1. Buka `index.html` di browser
2. Klik ⚙️ → paste API Key → pilih model → Simpan
3. Mulai ngobrol!

## 🚀 Deploy ke GitHub Pages

1. Upload semua file ke repository GitHub
2. **Settings → Pages** → branch `main`, folder `/ (root)` → Save
3. Chatbot online di `https://username.github.io/nama-repo/`

## ⚠️ Keamanan

- **JANGAN** tulis API key langsung di kode yang di-commit
- Key dimasukkan lewat menu ⚙️ dan tersimpan hanya di browser masing-masing pengguna

## 📁 Struktur

```
chatbot-ai-gemini/
├── index.html    # Halaman chat + modal API key
├── style.css     # Tema (sama dengan versi OpenAI)
├── script.js     # Logika + koneksi Gemini API
└── README.md
```

## 💡 Gemini vs OpenAI

| | Gemini | OpenAI |
|---|--------|--------|
| Free tier | ✅ Ada (tanpa kartu kredit) | Terbatas, perlu saldo |
| Model cepat | gemini-2.5-flash | gpt-4o-mini |
| Mendapat key | aistudio.google.com/apikey | platform.openai.com/api-keys |

## 📄 Lisensi

Bebas untuk belajar & proyek pribadi.
