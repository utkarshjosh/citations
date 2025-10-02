# Brain Scroll - Quick Start Guide 🚀

## Get Up and Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Git

---

## Step 1: Clone & Setup

```bash
# Already cloned, so just navigate to project
cd /home/ongraph/CODE/self/brain-scroll
```

---

## Step 2: Backend Setup

```bash
# Navigate to API directory
cd api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB connection
# MONGODB_URI=mongodb://localhost:27017/brain-scroll
# PORT=3000

# Start the backend
npm start
```

**Backend will run on**: `http://localhost:3000`

---

## Step 3: Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:3000/api

# Start the frontend
npm run dev
```

**Frontend will run on**: `http://localhost:5173`

---

## Step 4: Add Sample Data (Optional)

### Option A: Use MongoDB Compass
1. Connect to your MongoDB
2. Create database: `brain-scroll`
3. Create collection: `papers`
4. Import sample papers (see below)

### Option B: Use MongoDB Shell
```javascript
use brain-scroll

db.papers.insertMany([
  {
    arxiv_id: "2401.00001",
    title: "Attention Is All You Need: A Retrospective",
    authors: ["John Doe", "Jane Smith"],
    abstract: "A comprehensive review of the Transformer architecture...",
    summary: "This paper revisits the groundbreaking Transformer model, explaining why attention mechanisms revolutionized NLP and how they've evolved since 2017.",
    why_it_matters: "Understanding Transformers is crucial for anyone working with modern AI, as they power GPT, BERT, and most state-of-the-art models.",
    applications: [
      "Language translation",
      "Text generation",
      "Question answering",
      "Code completion"
    ],
    category: "cs.LG",
    arxiv_url: "https://arxiv.org/abs/2401.00001",
    published_date: new Date("2024-01-01"),
    likes_count: 42,
    views_count: 156,
    processed: true,
    processed_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    arxiv_id: "2401.00002",
    title: "Diffusion Models for Image Generation",
    authors: ["Alice Johnson", "Bob Williams"],
    abstract: "Exploring the mathematics behind stable diffusion...",
    summary: "Diffusion models have taken the AI art world by storm. This paper breaks down the math behind how they turn noise into beautiful images.",
    why_it_matters: "Diffusion models power tools like Midjourney, DALL-E, and Stable Diffusion, making AI art accessible to millions.",
    applications: [
      "AI art generation",
      "Image editing",
      "Video synthesis",
      "3D model creation"
    ],
    category: "cs.CV",
    arxiv_url: "https://arxiv.org/abs/2401.00002",
    published_date: new Date("2024-01-02"),
    likes_count: 38,
    views_count: 142,
    processed: true,
    processed_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    arxiv_id: "2401.00003",
    title: "Large Language Models: Capabilities and Limitations",
    authors: ["Emily Chen", "Michael Brown"],
    abstract: "A systematic analysis of what LLMs can and cannot do...",
    summary: "LLMs like GPT-4 are powerful but not magic. This paper explores their strengths, weaknesses, and where they might fail unexpectedly.",
    why_it_matters: "As LLMs become ubiquitous, understanding their limitations is crucial for building reliable AI systems and avoiding costly mistakes.",
    applications: [
      "Chatbots and assistants",
      "Content generation",
      "Code assistance",
      "Research summarization"
    ],
    category: "cs.AI",
    arxiv_url: "https://arxiv.org/abs/2401.00003",
    published_date: new Date("2024-01-03"),
    likes_count: 51,
    views_count: 203,
    processed: true,
    processed_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }
])
```

---

## Step 5: Test the App

### 1. Open Browser
Navigate to: `http://localhost:5173`

### 2. Landing Page
- You'll see the vibrant landing page
- Select categories you're interested in
- Click "Start Scrolling"

### 3. Feed Experience
- **Swipe up** to see next paper
- **Swipe down** to go back
- **Click heart** to like
- **Click bookmark** to save
- **Click share** to share
- **Click "Why It Matters"** to expand details

### 4. Test PWA
- Open DevTools (F12)
- Go to Application tab
- Check Service Worker is registered
- Check Manifest is loaded
- Try offline mode!

---

## 🎨 Customization

### Change Colors
Edit `/frontend/src/theme/colors.js`

### Change Categories
Edit `/frontend/src/pages/Landing.jsx` - CATEGORIES array

### Adjust API Timeout
Edit `/frontend/src/services/api.js` - timeout value

### Modify Swipe Sensitivity
Edit `/frontend/src/components/SwipeFeed/SwipeFeed.jsx` - threshold value

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` or `mongo`
- Verify .env file exists and has correct MONGODB_URI
- Check port 3000 is not in use: `lsof -i :3000`

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 5173 is not in use
- Verify .env file has correct VITE_API_URL

### No papers showing
- Check backend is running and accessible
- Check MongoDB has papers in the `papers` collection
- Open browser console for errors
- Check Network tab in DevTools

### Service Worker not registering
- Must use HTTPS or localhost
- Check browser console for errors
- Clear cache and reload
- Check `/public/sw.js` exists

---

## 📱 Test on Mobile

### Option 1: Local Network
1. Find your local IP: `ifconfig` or `ipconfig`
2. Update frontend .env: `VITE_API_URL=http://YOUR_IP:3000/api`
3. Restart frontend
4. On mobile, visit: `http://YOUR_IP:5173`

### Option 2: ngrok
```bash
# Install ngrok
npm install -g ngrok

# Expose frontend
ngrok http 5173

# Expose backend
ngrok http 3000
```

---

## 🚀 Deploy to Production

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Railway)
```bash
cd api
railway login
railway init
railway up
```

### Environment Variables
Don't forget to set production env vars!

---

## 📊 Monitor Performance

### Frontend
- Open DevTools > Lighthouse
- Run audit for Performance, PWA, Accessibility
- Target scores: 90+ across the board

### Backend
- Use `pm2` for process management
- Set up logging with Winston
- Monitor with Sentry or similar

---

## 🎉 You're Ready!

Your Brain Scroll app is now running locally. Start swiping through research papers like TikTok! 🧠📱

### Next Steps:
1. Add more sample papers
2. Test all features
3. Customize colors/branding
4. Deploy to production
5. Share with friends!

---

## 💬 Need Help?

- Check `IMPLEMENTATION_SUMMARY.md` for detailed docs
- Review task files in `.taskmaster/tasks/`
- Check component files for inline documentation
- Open an issue on GitHub

**Happy Scrolling! 🚀**
