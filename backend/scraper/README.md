# arXiv Paper Scraper

A clean, organized arXiv paper scraper that fetches, processes, and stores research papers using LangGraph workflows.

## Overview

This scraper consists of three main components:

1. **Paper Fetcher** - Fetches papers from arXiv for configured categories
2. **Paper Processor** - Processes papers through LangGraph workflow to generate summaries and insights
3. **Pipeline Runner** - Orchestrates the complete fetch -> process -> store pipeline

## Directory Structure

```
scraper/
├── logs/                          # Log files and output data
├── fetch_papers.py               # Script to fetch papers from arXiv
├── process_papers.py             # Script to process papers through LangGraph
├── run_pipeline.py               # Complete pipeline runner
├── main.py                       # Main entry point
├── config.py                     # Configuration settings
├── agentic_paper_fetcher.py      # Paper fetching logic
├── paper_processing_workflow.py  # LangGraph workflow for processing
├── db_connection.py              # MongoDB connection
├── deduplication.py              # Paper deduplication logic
├── arxiv_client.py               # arXiv API client
└── requirements.txt              # Python dependencies
```

## Quick Start

### 1. Setup Environment

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY="your_gemini_api_key"  # or GROQ_API_KEY
export MONGODB_URI="mongodb://localhost:27017/brain_scroll"
```

### 2. Run Complete Pipeline

```bash
# Run the complete pipeline (fetch + process + store)
python main.py

# Or use the pipeline runner directly
python run_pipeline.py
```

### 3. Run Individual Steps

```bash
# Fetch papers only
python fetch_papers.py

# Process papers from a file
python process_papers.py logs/fetched_papers_20250103_120000.json

# Process with custom settings
python fetch_papers.py --max-papers 100 --days-back 3
```

## Configuration

Edit `config.py` to customize:

- **CS_CATEGORIES**: arXiv categories to scrape
- **MAX_PAPERS_PER_CATEGORY**: Maximum papers per category
- **DAYS_BACK**: How many days back to look for papers
- **MONGODB_URI**: MongoDB connection string

## Scripts

### fetch_papers.py

Fetches papers from arXiv for all configured categories.

**Usage:**

```bash
python fetch_papers.py [options]

Options:
  --categories CATEGORIES    arXiv categories (default: all CS categories)
  --max-papers N            Max papers per category (default: 50)
  --days-back N             Days to look back (default: 1)
  --output FILE             Output JSON file path
```

**Output:** Saves papers to `logs/fetched_papers_TIMESTAMP.json`

### process_papers.py

Processes fetched papers through LangGraph workflow to generate summaries, insights, and applications.

**Usage:**

```bash
python process_papers.py INPUT_FILE [options]

Options:
  --output FILE             Output JSON file path
  --no-db                   Don't store in MongoDB
  --no-dedup                Don't skip duplicate papers
  --single ARXIV_ID         Process a single paper by ID
```

**Output:** Saves processed papers to `logs/processed_papers_TIMESTAMP.json`

### run_pipeline.py

Runs the complete pipeline: fetch papers -> process papers -> store in database.

**Usage:**

```bash
python run_pipeline.py [options]

Options:
  --categories CATEGORIES    arXiv categories
  --max-papers N            Max papers per category
  --days-back N             Days to look back
  --skip-fetch              Skip fetching step
  --skip-process            Skip processing step
  --input-file FILE         Use existing file instead of fetching
```

## LangGraph Workflow

The paper processing workflow consists of 5 nodes:

1. **Ingestion** - Validates input data
2. **Summary Generation** - Creates 3-5 line plain English summary
3. **Why It Matters** - Explains significance and impact
4. **Applications** - Identifies practical use cases
5. **Quality Validation** - Validates all generated content

## Output Format

### Fetched Papers

```json
{
  "metadata": {
    "start_time": "2025-01-03T12:00:00",
    "categories": ["cs.AI", "cs.LG"],
    "total_papers": 100
  },
  "papers": [
    {
      "arxiv_id": "2401.12345",
      "title": "Paper Title",
      "authors": ["Author 1", "Author 2"],
      "abstract": "Paper abstract...",
      "category": "cs.AI",
      "published": "2025-01-02T00:00:00Z"
    }
  ]
}
```

### Processed Papers

```json
{
  "metadata": {
    "total_papers": 100,
    "papers_processed": 95,
    "papers_stored": 90
  },
  "papers": [
    {
      "arxiv_id": "2401.12345",
      "title": "Paper Title",
      "summary": "This paper presents...",
      "why_it_matters": "This research is significant because...",
      "applications": ["Application 1", "Application 2"],
      "processed": true
    }
  ]
}
```

## Logs

All logs are saved to the `logs/` directory:

- `fetch_papers.log` - Paper fetching logs
- `process_papers.log` - Paper processing logs
- `pipeline.log` - Complete pipeline logs
- `fetched_papers_*.json` - Fetched paper data
- `processed_papers_*.json` - Processed paper data

## Error Handling

- Failed papers are logged with error details
- Processing continues even if individual papers fail
- Statistics are provided for success/failure rates
- Duplicate papers are automatically skipped

## Dependencies

- `paper-search-mcp` - arXiv paper search
- `langgraph` - Workflow orchestration
- `langchain-google-genai` - Gemini LLM integration
- `langchain-groq` - Groq LLM integration
- `pymongo` - MongoDB connection
- `python-dotenv` - Environment variable loading

## Environment Variables

Required:

- `GEMINI_API_KEY` or `GROQ_API_KEY` - LLM API key

Optional:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `LOG_LEVEL` - Logging level (INFO, DEBUG, etc.)
