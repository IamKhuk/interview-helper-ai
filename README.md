# 🎤 Interview Helper AI

**Interview Helper AI** – your personal real-time co-pilot for interviews, meetings, and technical discussions.  
It listens, analyzes, and helps you answer confidently — all while staying private and running locally or with cloud-powered AI.

---

## 🎯 Overview

Interview Helper AI assists you in **answering interview questions naturally and confidently**.  
It transcribes and interprets questions from **audio, text, or screenshots**, then generates **ready-to-speak, first-person answers** — so you sound like the best version of yourself.

---

## 🧠 Powered by Gemini & Ollama

- **Gemini (Google AI)** – fast, accurate cloud intelligence  
- **Ollama (Local AI)** – fully private, offline processing  

Choose between cloud or local AI for maximum control and flexibility.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Git
- Either:
  - **Google Gemini API key** (from [Google AI Studio](https://makersuite.google.com/app/apikey))
  - **or** [Ollama](https://ollama.ai) installed locally for private AI use

---

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd interview-helper-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   If you encounter Sharp or Python errors:
   ```bash
   SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --ignore-scripts
   npm rebuild sharp
   ```

3. **Create a `.env` file** in the root directory and add your configuration:

   **For Gemini (Cloud AI):**
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   **For Ollama (Local AI):**
   ```env
   USE_OLLAMA=true
   OLLAMA_MODEL=llama3.2
   OLLAMA_URL=http://localhost:11434
   ```

---

### Running the App

#### Development Mode
```bash
npm start
```
- Launches the Vite dev server on port 5173  
- Starts the Electron desktop app  
- Connects automatically to Gemini or Ollama  

#### Production Build
```bash
npm run dist
```
The compiled app will be available in the `release` folder.

---

## ⚙️ AI Providers

### 🧩 Ollama (Local AI – Recommended for Privacy)

**Pros**
- 100% local, no data leaves your machine  
- Free and works offline  
- Supports models like `llama3.2`, `mistral`, `codellama`, and others  

**Setup**
```bash
brew install ollama   # or download from https://ollama.ai
ollama pull llama3.2
ollama serve
```

### ☁️ Google Gemini

**Pros**
- Advanced reasoning and multimodal understanding  
- Fastest responses and highest accuracy  

**Cons**
- Requires API key  
- Internet access required  
- Usage may incur costs  

---

## 🖥️ Usage Tips

### Stopping the App
- Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac) in the terminal  
- If ports remain busy:
  ```bash
  lsof -i :5173
  kill -9 [PID]
  ```
- Or run:
  ```bash
  npm run clean
  ```

### Keyboard Shortcuts

| Shortcut | Action |
|-----------|---------|
| `Cmd/Ctrl + B` | Toggle window visibility |
| `Cmd/Ctrl + H` | Capture screenshot |
| `Cmd/Ctrl + Enter` | Generate AI answer |
| `Cmd/Ctrl + Arrows` | Move the window |

---

## 🧩 Core Features

### 🎤 Real-Time Interview Assistant
- Converts interviewer’s audio into text  
- Generates clear, confident first-person answers  
- Sounds natural and human-like — as if **you** are speaking  

### 🖼️ Visual Understanding
- Analyze screenshots or code snippets  
- Get contextual explanations or direct answers  

### 💬 Contextual Conversation
- Ask follow-ups naturally  
- Keeps track of the conversation topic  

### 🛡️ Privacy Options
- Use **Ollama** for 100% offline mode  
- Screenshots auto-deleted after processing  
- No data tracking or remote logging  

### 🧠 Smart Answer Generation
- Custom-tuned prompts for interview scenarios  
- Tailored for QA, Dev, and Software Engineering domains  
- Fluent, natural, and ready-to-speak phrasing  

---

## 🧑‍💻 Use Cases

### 🧾 Interview Coaching
```
✓ Practice technical or behavioral interviews  
✓ Generate realistic, first-person answers  
✓ Simulate HR or coding challenges  
✓ Improve confidence and fluency
```

### 🧩 Technical Support
```
✓ Debug code snippets or screenshots  
✓ Explain test automation concepts  
✓ Simplify QA methodologies
```

### 🎙️ Meeting or Presentation Assistant
```
✓ Summarize discussions  
✓ Suggest key talking points  
✓ Generate concise spoken responses
```

---

## ⚠️ Troubleshooting

### Common Issues

**Port Conflict**
```bash
kill -9 $(lsof -t -i:5173)
```

**Sharp/Python Errors**
```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --ignore-scripts
npm rebuild sharp
```

**App Not Launching**
- Ensure Vite is using port `5173`  
- Confirm Ollama is running (`ollama serve`)  

---

## 🧩 Supported Models

- **Gemini 2.0 Flash** – Cloud AI with vision and reasoning  
- **Llama 3.2** – Local, fast, high-quality text generation  
- **Mistral** – Lightweight and responsive  
- **CodeLlama** – Specialized for coding tasks  
- **Custom Models** – Any model supported by Ollama  

---

## 🖥️ System Requirements

```
Minimum:  4GB RAM, Dual-core CPU
Recommended: 8GB RAM, Quad-core CPU
Optimal:   16GB+ RAM for local AI models
```

---

## 🤝 Contributing

Contributions are welcome!  
You can help improve Interview Helper AI by adding:

- New AI model integrations  
- Enhanced prompts for interview types  
- UI/UX improvements  
- Documentation and translations  

Submit a pull request or open an issue on GitHub.

---

## 📄 License

**ISC License** – Free for personal and commercial use.

---

## ⭐ Support

If this project helps you prepare for interviews or practice your communication skills, please ⭐ star the repo on GitHub!

---

### 🏷️ Tags
`interview-ai` `voice-assistant` `qa-engineer` `ollama` `gemini-ai` `electron` `vite` `cross-platform` `ai-coach` `privacy-first` `local-ai` `audio-analysis` `real-time-assistant` `technical-interview`