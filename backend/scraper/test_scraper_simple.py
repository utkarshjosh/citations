#!/usr/bin/env python3
"""
Simple test script to verify scraper.py works
"""
import sys
import os
from pathlib import Path

# paper-search-mcp is now installed as a package via uv

def test_scraper():
    """Test the scraper with minimal configuration"""
    try:
        from scraper import PaperScraper
        print("✅ Scraper imported successfully!")
        
        # Create scraper instance
        scraper = PaperScraper()
        print("✅ Scraper instance created!")
        
        # Test with just one category and minimal papers
        print("🧪 Testing with minimal configuration...")
        result = scraper.run(
            categories=["cs.AI"],  # Just one category
            max_papers_per_category=2,  # Just 2 papers
            days_back=1  # Just 1 day
        )
        
        print("🎉 Scraper test completed!")
        print(f"✅ Success: {result['success']}")
        print(f"📊 Papers fetched: {result['total_fetched']}")
        print(f"📊 Papers inserted: {result['total_inserted']}")
        print(f"📊 Duplicates found: {result['total_duplicates']}")
        print(f"📊 Errors: {result['total_errors']}")
        
        return result['success']
        
    except Exception as e:
        print(f"❌ Error during scraper test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_scraper()
    sys.exit(0 if success else 1)

