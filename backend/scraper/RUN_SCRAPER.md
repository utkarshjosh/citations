# How to Run scraper.py

## ✅ Quick Start

The scraper is now ready to run! Here are the different ways to execute it:

### Method 1: Using the Run Script (Recommended)

```bash
cd /home/ongraph/CODE/self/brain-scroll/backend/scraper
/usr/bin/python3 run_scraper.py
```

### Method 2: Direct Execution

```bash
cd /home/ongraph/CODE/self/brain-scroll/backend/scraper
/usr/bin/python3 scraper.py
```

### Method 3: Test with Minimal Configuration

```bash
cd /home/ongraph/CODE/self/brain-scroll/backend/scraper
/usr/bin/python3 test_scraper_simple.py
```

## 🔧 Prerequisites

### 1. API Key (Required)

You need either a Gemini or Groq API key:

```bash
# Option A: Gemini API Key
export GEMINI_API_KEY="your-gemini-api-key-here"

# Option B: Groq API Key
export GROQ_API_KEY="your-groq-api-key-here"
```

### 2. MongoDB (Required)

Make sure MongoDB is running:

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod
```

### 3. Dependencies (Already Installed)

All required dependencies are installed:

- ✅ paper_search_mcp (submodule)
- ✅ pymongo
- ✅ google-generativeai
- ✅ python-dotenv
- ✅ All other requirements

## 📋 Configuration

The scraper uses these default settings (configurable via environment variables):

```bash
# Optional: Customize settings
export MAX_PAPERS_PER_CATEGORY=50  # Default: 50
export DAYS_BACK=1                 # Default: 1
export LOG_LEVEL=INFO              # Default: INFO
export MONGODB_URI="mongodb://localhost:27017/brain_scroll"  # Default
```

## 🚀 What the Scraper Does

1. **Fetches Papers**: Uses AI to intelligently search arXiv for papers in CS categories
2. **Deduplicates**: Removes duplicate papers automatically
3. **Stores**: Saves papers to MongoDB database
4. **Logs**: Creates detailed logs of the process

### Categories Scraped:

- cs.AI (Artificial Intelligence)
- cs.CL (Computation and Language/NLP)
- cs.LG (Machine Learning)
- cs.CV (Computer Vision)
- cs.NE (Neural and Evolutionary Computing)
- cs.RO (Robotics)
- cs.IR (Information Retrieval)

## 📊 Output

The scraper will:

- Print progress to console
- Create a log file: `scraper_YYYYMMDD_HHMMSS.log`
- Store papers in MongoDB database
- Return statistics on completion

## 🐛 Troubleshooting

### Common Issues:

1. **"No module named 'paper_search_mcp'"**

   - ✅ **FIXED**: The path fix is already applied

2. **"No API key found"**

   - Set either `GEMINI_API_KEY` or `GROQ_API_KEY`

3. **"MongoDB connection failed"**

   - Make sure MongoDB is running: `sudo systemctl start mongod`

4. **"Import errors"**
   - Use `/usr/bin/python3` instead of just `python3`

## 🧪 Testing

Run a quick test with minimal configuration:

```bash
/usr/bin/python3 test_scraper_simple.py
```

This will:

- Test with only 1 category (cs.AI)
- Fetch only 2 papers
- Check if everything works correctly

## 📝 Logs

Logs are saved to:

- Console output (real-time)
- File: `scraper_YYYYMMDD_HHMMSS.log`

## 🎯 Success Indicators

You'll know it's working when you see:

```
✅ Scraper imported successfully!
✅ Scraper instance created!
🚀 Starting scraper...
INFO - Starting arXiv paper scraping pipeline
INFO - Categories to scrape: cs.AI, cs.CL, cs.LG, cs.CV, cs.NE, cs.RO, cs.IR
INFO - Fetching papers from arXiv using agentic approach...
```

## 🔄 Running on Remote Server

To deploy to a remote server:

1. **Copy the updated files**:

   - `agentic_paper_fetcher.py` (with path fix)
   - `run_scraper.py`
   - `test_scraper_simple.py`

2. **Install dependencies**:

   ```bash
   pip3 install pymongo python-dotenv google-generativeai groq tenacity requests feedparser beautifulsoup4 lxml httpx pypdf2
   ```

3. **Set API key**:

   ```bash
   export GEMINI_API_KEY="your-key"
   ```

4. **Run**:
   ```bash
   /usr/bin/python3 run_scraper.py
   ```

The scraper is now fully functional! 🎉

