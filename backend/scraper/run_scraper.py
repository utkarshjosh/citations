#!/usr/bin/env python3
"""
Simple runner script for scraper.py
This script ensures the paper_search_mcp path is set correctly and runs the scraper
"""
import sys
import os
from pathlib import Path

# paper-search-mcp is now installed as a package via uv

# Set environment variables if not set
if not os.getenv("GEMINI_API_KEY") and not os.getenv("GROQ_API_KEY"):
    print("⚠️  Warning: Neither GEMINI_API_KEY nor GROQ_API_KEY is set.")
    print("   The scraper may fail without an API key.")
    print("   Set one of these environment variables to continue.")

# Import and run the scraper
try:
    from scraper import main
    print("🚀 Starting scraper...")
    main()
except Exception as e:
    print(f"❌ Error running scraper: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

