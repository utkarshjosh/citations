# Brain Scroll - arXiv Scraper

Python-based scraper for fetching and storing CS research papers from arXiv.

## Features

- Fetches papers from multiple CS categories (AI, ML, NLP, CV, etc.)
- Rate limiting to respect arXiv API guidelines (3 requests/second)
- Automatic deduplication based on arXiv ID
- Robust error handling and retry logic
- MongoDB storage with optimized indexes
- Comprehensive logging

## Setup

### Prerequisites

- Python 3.11+
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### Configuration

Edit `.env` file:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/brain_scroll
MONGODB_DB_NAME=brain_scroll

# Scraper Configuration
MAX_PAPERS_PER_CATEGORY=50
DAYS_BACK=1

# Logging
LOG_LEVEL=INFO
```

## Usage

### Run Scraper

```bash
python scraper.py
```

This will:
1. Connect to MongoDB
2. Fetch papers from configured CS categories
3. Deduplicate against existing papers
4. Store new papers in database
5. Generate detailed logs

### Run Tests

```bash
python test_scraper.py
```

Tests include:
- Database connection
- arXiv API client
- Deduplication logic
- Full pipeline integration

### Custom Scraping

```python
from scraper import PaperScraper

scraper = PaperScraper()

# Custom categories and parameters
result = scraper.run(
    categories=["cs.AI", "cs.LG"],
    max_papers_per_category=100,
    days_back=7
)

print(f"Inserted: {result['total_inserted']} papers")
```

## Project Structure

```
backend/scraper/
├── __init__.py           # Package initialization
├── config.py             # Configuration and settings
├── db_connection.py      # MongoDB connection handler
├── arxiv_client.py       # arXiv API client wrapper
├── deduplication.py      # Deduplication logic
├── scraper.py            # Main orchestration script
├── test_scraper.py       # Test suite
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
└── README.md             # This file
```

## Database Schema

Papers are stored with the following schema:

```json
{
  "arxiv_id": "2401.12345",
  "title": "Paper Title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Full abstract text...",
  "arxiv_url": "https://arxiv.org/abs/2401.12345",
  "pdf_url": "https://arxiv.org/pdf/2401.12345",
  "category": "cs.AI",
  "primary_category": "cs.AI",
  "categories": ["cs.AI", "cs.LG"],
  "published": "2024-01-15T00:00:00",
  "updated": "2024-01-15T00:00:00",
  "created_at": "2025-10-01T12:00:00",
  "processed_at": null,
  "summary": null,
  "why_it_matters": null,
  "applications": null,
  "likes_count": 0,
  "views_count": 0
}
```

## CS Categories

Default categories scraped:
- `cs.AI` - Artificial Intelligence
- `cs.CL` - Computation and Language (NLP)
- `cs.LG` - Machine Learning
- `cs.CV` - Computer Vision
- `cs.NE` - Neural and Evolutionary Computing
- `cs.RO` - Robotics
- `cs.IR` - Information Retrieval

## Scheduling

### Cron Job (Linux/Mac)

Add to crontab for daily execution at 2 AM:

```bash
crontab -e
```

Add line:
```
0 2 * * * cd /path/to/brain-scroll/backend/scraper && /usr/bin/python3 scraper.py >> /var/log/brain-scroll-scraper.log 2>&1
```

### Task Scheduler (Windows)

Create a scheduled task to run `scraper.py` daily.

## Logging

Logs are written to:
- Console (stdout)
- File: `scraper_YYYYMMDD_HHMMSS.log`

Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

## Error Handling

The scraper includes:
- Exponential backoff for API retries
- Connection pooling for MongoDB
- Graceful handling of duplicates
- Comprehensive error logging
- Health checks before processing

## Performance

- Rate limited to 3 requests/second (arXiv guideline)
- Bulk insert operations for efficiency
- Database indexes on frequently queried fields
- Connection pooling for optimal performance

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
```

### arXiv API Errors
- Respect rate limits (3 req/sec)
- Check network connectivity
- Verify category names are valid

### No Papers Fetched
- Adjust `DAYS_BACK` to look further back
- Check if papers exist in selected categories
- Verify date range in logs

## Next Steps

After scraping, papers need LLM processing:
1. Generate summaries
2. Extract "why it matters"
3. Identify applications
4. Update `processed_at` timestamp

See `../processor/` for LangGraph processing pipeline.
