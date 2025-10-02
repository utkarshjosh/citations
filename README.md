# 🧠 Brain Scroll

> **TikTok for Research Papers** - Swipe through cutting-edge CS research in plain English

Brain Scroll transforms dense academic papers into addictive, swipeable content. Get daily curated papers from arXiv with AI-powered summaries, presented in a full-screen, mobile-first experience designed for maximum engagement.

## ✨ What's New (v2.0)

🔥 **Complete UI Overhaul** - TikTok/Instagram-style single-card experience
🎨 **Vibrant Design** - Stunning gradients and modern color palette
📱 **PWA Ready** - Install to home screen, works offline
❤️ **Like System** - Full engagement tracking with backend integration
🚀 **Enhanced API** - Retry logic, error handling, trending algorithm
⚡ **Performance** - Optimized for mobile, smooth 60fps animations

## 🌟 Features

### Core Experience

- **🎯 Single-Card Focus**: ONE paper at a time - maximum attention, zero distractions
- **👆 Swipe Navigation**: Vertical swipe (up/down) like TikTok - addictive by design
- **🎨 Vibrant Gradients**: Each category has unique, eye-catching colors
- **📱 Mobile-First**: Built for phones, optimized for thumbs
- **💫 Smooth Animations**: Buttery 60fps transitions with Framer Motion

### Content & Discovery

- **📚 Daily Papers**: Fresh CS research from arXiv (AI, ML, NLP, CV, etc.)
- **🤖 AI Summaries**: Plain English 3-5 line summaries
- **💡 Why It Matters**: Key insights and practical applications
- **🔥 Trending**: Algorithm-powered trending papers
- **🏷️ Categories**: Filter by CS categories with beautiful gradients

### Engagement

- **❤️ Like System**: Session-based tracking, optimistic UI updates
- **🔖 Save Papers**: Bookmark for later reading
- **📤 Share**: Native share API integration
- **📊 View Tracking**: Anonymous engagement metrics

### Technical

- **📲 PWA**: Install to home screen, works offline
- **🔄 Auto-Retry**: Network resilience with exponential backoff
- **⚡ Caching**: Smart caching strategies for performance
- **🎯 Error Handling**: User-friendly error messages

## 🏗️ Architecture

Brain Scroll is built as a modern monorepo with three main components:

```
brain-scroll/
├── backend/
│   ├── scraper/          # Python agentic paper fetcher with MCP integration
│   └── paper-search-mcp/ # MCP server for multi-source paper searching
├── api/                  # Node.js/Express REST API
├── frontend/             # React + Vite + Mantine UI
└── docker-compose.yml    # Full stack orchestration
```

### Technology Stack

**Backend (Scraper)**

- Python 3.11+
- MCP (Model Context Protocol) with paper-search-mcp
- Gemini/Groq LLMs for intelligent summarization
- MongoDB for data storage
- Agentic architecture for autonomous operation

**API**

- Node.js 18+
- Express.js
- MongoDB driver
- Rate limiting & security middleware

**Frontend**

- React 18
- Vite
- Mantine UI
- React Router

**Infrastructure**

- Docker & Docker Compose
- MongoDB 7.0

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- MongoDB (or use Docker)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd brain-scroll
   ```

2. **Set up environment variables**

   ```bash
   # Root level
   cp .env.example .env

   # Backend scraper
   cp backend/scraper/.env.example backend/scraper/.env

   # API
   cp api/.env.example api/.env

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Configure API keys**

   Edit `backend/scraper/.env` and add your LLM API keys:

   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key  # Optional fallback
   ```

### Running with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **MongoDB**: localhost:27017

### Running Locally (Development)

**Backend Scraper**

```bash
cd backend/scraper
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scraper.py
```

**API**

```bash
cd api
npm install
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## 📦 Project Structure

```
brain-scroll/
├── .cursor/                    # Cursor IDE configuration
│   ├── mcp.json               # MCP server configuration
│   └── rules/                 # AI coding rules
├── .taskmaster/               # TaskMaster AI project management
│   ├── docs/                  # Project documentation
│   └── tasks/                 # Task definitions
├── backend/
│   ├── scraper/
│   │   ├── agentic_paper_fetcher.py  # Agentic paper fetching with LLM
│   │   ├── scraper.py                # Main orchestration
│   │   ├── db_connection.py          # MongoDB connection
│   │   ├── deduplication.py          # Duplicate detection
│   │   ├── config.py                 # Configuration
│   │   ├── requirements.txt          # Python dependencies
│   │   └── Dockerfile
│   └── paper-search-mcp/      # MCP server for paper searching
├── api/
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Data models
│   │   └── index.js           # Entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilities
│   │   └── styles/            # CSS styles
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml         # Multi-container orchestration
├── .gitignore
├── .eslintrc.json            # JavaScript linting
├── .prettierrc               # Code formatting
├── .editorconfig             # Editor configuration
└── README.md
```

## 🤖 Agentic Architecture

Brain Scroll uses an **agentic approach** for paper scraping:

1. **MCP Integration**: Uses [paper-search-mcp](https://github.com/openags/paper-search-mcp) for multi-source paper discovery
2. **LLM-Powered**: Gemini/Groq models generate intelligent summaries and insights
3. **Autonomous**: Can be scheduled to run independently
4. **Multi-Source**: Supports arXiv, PubMed, bioRxiv, and more

## 🧪 Testing

**Backend**

```bash
cd backend/scraper
python test_scraper.py
```

**API**

```bash
cd api
npm test
```

**Frontend**

```bash
cd frontend
npm test
```

## 📝 Development Workflow

1. **Code Standards**: Follow ESLint, Prettier, and Flake8 configurations
2. **Git Workflow**: Feature branches → Pull requests → Main
3. **Testing**: Write tests for new features
4. **Documentation**: Update README and inline docs

## 🔧 Configuration

### CS Categories

Edit `backend/scraper/config.py` to customize categories:

```python
CS_CATEGORIES = [
    "cs.AI",   # Artificial Intelligence
    "cs.CL",   # Computation and Language (NLP)
    "cs.LG",   # Machine Learning
    "cs.CV",   # Computer Vision
    "cs.NE",   # Neural and Evolutionary Computing
    "cs.RO",   # Robotics
    "cs.IR",   # Information Retrieval
]
```

### Scraping Schedule

Configure cron job for daily scraping:

```bash
# Run daily at 6 AM
0 6 * * * cd /path/to/brain-scroll/backend/scraper && python scraper.py
```

## 🚢 Deployment

### Docker Production

```bash
# Build and start in production mode
docker-compose -f docker-compose.yml up -d --build

# Scale services
docker-compose up -d --scale api=3
```

### Environment Variables

See `.env.example` files in each directory for required configuration.

## 📊 Monitoring

- **API Health**: http://localhost:3000/health
- **MongoDB**: Use MongoDB Compass or mongosh
- **Logs**: `docker-compose logs -f [service-name]`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [arXiv](https://arxiv.org/) for providing open access to research papers
- [paper-search-mcp](https://github.com/openags/paper-search-mcp) for MCP integration
- [Mantine](https://mantine.dev/) for the beautiful UI components

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for the research community**
