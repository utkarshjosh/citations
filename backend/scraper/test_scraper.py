"""
Test script to validate scraper functionality
"""
import logging
from datetime import datetime

from arxiv_client import ArxivClient
from db_connection import db_connection, get_papers_collection
from deduplication import PaperDeduplicator
from config import LOG_LEVEL, LOG_FORMAT

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL), format=LOG_FORMAT)
logger = logging.getLogger(__name__)


def test_database_connection():
    """Test MongoDB connection"""
    logger.info("\n" + "=" * 80)
    logger.info("Testing Database Connection")
    logger.info("=" * 80)
    
    try:
        db_connection.connect()
        if db_connection.health_check():
            logger.info("✓ Database connection successful")
            return True
        else:
            logger.error("✗ Database health check failed")
            return False
    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
        return False
    finally:
        db_connection.close()


def test_arxiv_client():
    """Test arXiv API client"""
    logger.info("\n" + "=" * 80)
    logger.info("Testing arXiv Client")
    logger.info("=" * 80)
    
    try:
        client = ArxivClient()
        
        # Test fetching a small number of papers
        logger.info("Fetching 5 papers from cs.AI...")
        papers = client.fetch_papers_by_category(
            category="cs.AI",
            max_results=5,
            days_back=7
        )
        
        if papers:
            logger.info(f"✓ Successfully fetched {len(papers)} papers")
            logger.info(f"Sample paper: {papers[0]['title'][:50]}...")
            return True
        else:
            logger.warning("✗ No papers fetched (might be expected if no recent papers)")
            return True  # Not necessarily a failure
            
    except Exception as e:
        logger.error(f"✗ arXiv client test failed: {e}")
        return False


def test_deduplication():
    """Test deduplication logic"""
    logger.info("\n" + "=" * 80)
    logger.info("Testing Deduplication")
    logger.info("=" * 80)
    
    try:
        db_connection.connect()
        deduplicator = PaperDeduplicator()
        
        # Create test paper
        test_paper = {
            "arxiv_id": f"test_{datetime.now().timestamp()}",
            "title": "Test Paper",
            "authors": ["Test Author"],
            "abstract": "Test abstract",
            "arxiv_url": "https://arxiv.org/abs/test",
            "pdf_url": "https://arxiv.org/pdf/test",
            "category": "cs.AI",
            "primary_category": "cs.AI",
            "categories": ["cs.AI"],
            "published": datetime.now(),
            "updated": datetime.now(),
            "created_at": datetime.now(),
            "processed_at": None,
            "summary": None,
            "why_it_matters": None,
            "applications": None,
            "likes_count": 0,
            "views_count": 0
        }
        
        # Test insertion
        logger.info("Testing paper insertion...")
        success = deduplicator.insert_paper(test_paper)
        
        if success:
            logger.info("✓ Paper inserted successfully")
            
            # Test duplicate detection
            logger.info("Testing duplicate detection...")
            exists = deduplicator.check_exists(test_paper["arxiv_id"])
            
            if exists:
                logger.info("✓ Duplicate detection works")
                
                # Cleanup test paper
                papers_collection = get_papers_collection()
                papers_collection.delete_one({"arxiv_id": test_paper["arxiv_id"]})
                logger.info("✓ Test paper cleaned up")
                
                return True
            else:
                logger.error("✗ Duplicate detection failed")
                return False
        else:
            logger.error("✗ Paper insertion failed")
            return False
            
    except Exception as e:
        logger.error(f"✗ Deduplication test failed: {e}")
        return False
    finally:
        db_connection.close()


def test_full_pipeline():
    """Test complete scraping pipeline with minimal data"""
    logger.info("\n" + "=" * 80)
    logger.info("Testing Full Pipeline")
    logger.info("=" * 80)
    
    try:
        from scraper import PaperScraper
        
        scraper = PaperScraper()
        
        # Run with minimal parameters
        logger.info("Running scraper with 3 papers from cs.AI...")
        result = scraper.run(
            categories=["cs.AI"],
            max_papers_per_category=3,
            days_back=7
        )
        
        if result['success']:
            logger.info("✓ Full pipeline test successful")
            logger.info(f"  Fetched: {result['total_fetched']}")
            logger.info(f"  Inserted: {result['total_inserted']}")
            logger.info(f"  Duplicates: {result['total_duplicates']}")
            return True
        else:
            logger.error(f"✗ Full pipeline test failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        logger.error(f"✗ Full pipeline test failed: {e}")
        return False


def main():
    """Run all tests"""
    logger.info("\n" + "=" * 80)
    logger.info("Brain Scroll Scraper - Test Suite")
    logger.info("=" * 80)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("arXiv Client", test_arxiv_client),
        ("Deduplication", test_deduplication),
        ("Full Pipeline", test_full_pipeline),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            logger.error(f"Test '{test_name}' crashed: {e}")
            results[test_name] = False
    
    # Summary
    logger.info("\n" + "=" * 80)
    logger.info("Test Summary")
    logger.info("=" * 80)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        logger.info(f"{status}: {test_name}")
    
    logger.info("=" * 80)
    logger.info(f"Results: {passed}/{total} tests passed")
    logger.info("=" * 80)
    
    return all(results.values())


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
