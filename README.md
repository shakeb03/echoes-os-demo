# 🧠 Echoes OS – Your Creative Second Brain

**Echoes OS** is an AI-driven tool that helps creators reverse-engineer their content to uncover original prompts, generate new creative drafts, and build a reusable memory system. It supports a wide range of input types—text, audio, YouTube links, and more—embedding and storing meaningful insights for future inspiration or retrieval.

> 🔗 [Live Demo (limited functionality)](https://echoes-os-demo.vercel.app)
Note: Due to YouTube OAuth & library limitations on EC2, the current demo is running on a local server.
---

## 🚀 Features

### ✅ Multi-Modal Content Uploads
- Upload **text files**, **audio**, **video**, or **paste content directly**.
- Supports direct input or URLs (e.g., blog links, YouTube videos).

### 🧠 Vector Memory Storage
- Content is chunked, embedded using OpenAI’s `text-embedding-ada-002` model, and stored in **ChromaDB**.
- Semantic search allows retrieval of relevant content by meaning, not just keywords.

### ✨ Prompt Deconstruction & Reconstruction
- **Step 1:** Analyze existing content to extract reverse-engineered creative prompts.
- **Step 2:** Use those prompts with your inputs (new title, topics, context) to generate new prompts.

### 📝 Guided AI Content Generation
- Final compositional prompt is used to generate original content via OpenAI’s `gpt-4` or `gpt-3.5`.

### 📽️ YouTube Transcript Extraction
- Automatically downloads and transcribes public YouTube videos (uses `yt-dlp` & Whisper).
- Embedded into memory system like other formats.

### 🔎 Conversational Ask API (Experimental)
- Ask questions to retrieve relevant memory chunks using vector similarity.

---

## ⚙️ Installation

### Backend (FastAPI + ChromaDB)
```bash
# 1. Clone the repo
git clone https://github.com/your-username/echoes-os.git
cd echoes-os

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Run the FastAPI backend
python3 src/main.py
Frontend (Next.js + TailwindCSS)
bash
Copy
Edit
# In a separate terminal, navigate to the root directory
cd echoes-os

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
🔐 Environment Variables
Create a .env file in the root with the following:

env
Copy
Edit
OPENAI_API_KEY=your_openai_key
Other values like ChromaDB path or YouTube configurations can be modified in their respective service files.

📡 External APIs & Libraries
Service	Purpose
OpenAI API	Embedding + GPT content generation
ChromaDB	Vector similarity search database
Whisper	Audio/video transcription
yt-dlp	YouTube video downloading
BeautifulSoup	HTML content scraping

🖥️ Deployment Notes
Originally deployed with:

Frontend: Vercel

Backend: AWS EC2 instance

Note: Due to YouTube OAuth & library limitations on EC2, the current demo is running on a local server.

The live version on Vercel has limited functionality (e.g., YouTube upload is disabled).

📎 Roadmap (Next Steps)
 Replace Whisper with faster ASR pipeline

 Add user auth and persistent memory collections

 Improve hybrid search (keyword + vector)

 UI polish + mobile responsiveness

 Export content to Notion, Markdown, etc.

🤝 Contributions & Feedback
Pull requests are welcome. For feedback, feel free to open an issue or connect via LinkedIn.

📄 License
MIT License © 2025
