"""
Configuration module for arXiv scraper
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/brain_scroll")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "brain_scroll")

# Scraper Configuration
MAX_PAPERS_PER_CATEGORY = int(os.getenv("MAX_PAPERS_PER_CATEGORY", "50"))
DAYS_BACK = int(os.getenv("DAYS_BACK", "1"))

# arXiv API Configuration
ARXIV_RATE_LIMIT = 3  # requests per second (arXiv guideline)
ARXIV_MAX_RETRIES = 3
ARXIV_RETRY_DELAY = 5  # seconds

# CS Categories to scrape
CS_CATEGORIES = [
    "cs.AI",  # Artificial Intelligence
    "cs.CL",  # Computation and Language (NLP)
    "cs.LG",  # Machine Learning
    "cs.CV",  # Computer Vision
    "cs.NE",  # Neural and Evolutionary Computing
    "cs.RO",  # Robotics
    "cs.IR",  # Information Retrieval
]

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
