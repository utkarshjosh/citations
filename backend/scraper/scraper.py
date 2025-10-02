"""
Main scraper orchestration script
Coordinates fetching, deduplication, and storage of arXiv papers
"""
import logging
import sys
from datetime import datetime
from typing import Dict, List

from agentic_paper_fetcher import AgenticPaperFetcher
from deduplication import PaperDeduplicator
from db_connection import db_connection
from config import CS_CATEGORIES, MAX_PAPERS_PER_CATEGORY, DAYS_BACK, LOG_LEVEL, LOG_FORMAT

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f"scraper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger(__name__)


class PaperScraper:
    """Main scraper orchestrator - now using agentic paper fetching"""
    
    def __init__(self):
        self.paper_fetcher = AgenticPaperFetcher()
        self.deduplicator = PaperDeduplicator()
        self.stats = {
            "total_fetched": 0,
            "total_inserted": 0,
            "total_duplicates": 0,
            "total_errors": 0,
            "categories_processed": 0,
            "categories_failed": 0
        }
    
    def run(
        self,
        categories: List[str] = None,
        max_papers_per_category: int = MAX_PAPERS_PER_CATEGORY,
        days_back: int = DAYS_BACK
    ) -> Dict:
        """
        Run the complete scraping pipeline
        
        Args:
            categories: List of categories to scrape (defaults to config)
            max_papers_per_category: Max papers per category
            days_back: Days to look back
            
        Returns:
            Dictionary with scraping statistics
        """
        start_time = datetime.now()
        logger.info("=" * 80)
        logger.info("Starting arXiv paper scraping pipeline")
        logger.info(f"Start time: {start_time}")
        logger.info("=" * 80)
        
        # Use default categories if none provided
        if categories is None:
            categories = CS_CATEGORIES
        
        logger.info(f"Categories to scrape: {', '.join(categories)}")
        logger.info(f"Max papers per category: {max_papers_per_category}")
        logger.info(f"Days back: {days_back}")
        
        try:
            # Connect to database
            logger.info("Connecting to database...")
            db_connection.connect()
            
            if not db_connection.health_check():
                logger.error("Database health check failed")
                return self._get_stats(start_time, success=False)
            
            logger.info("Database connection successful")
            
            # Fetch papers from all categories using agentic approach
            logger.info("\n" + "=" * 80)
            logger.info("Fetching papers from arXiv using agentic approach...")
            logger.info("=" * 80)
            
            all_papers = self.paper_fetcher.fetch_papers_by_categories(
                categories=categories,
                max_results_per_category=max_papers_per_category,
                days_back=days_back
            )
            
            # Process each category
            for category, papers in all_papers.items():
                self._process_category(category, papers)
            
            # Final statistics
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            logger.info("\n" + "=" * 80)
            logger.info("Scraping pipeline completed successfully")
            logger.info("=" * 80)
            logger.info(f"Duration: {duration:.2f} seconds")
            logger.info(f"Categories processed: {self.stats['categories_processed']}/{len(categories)}")
            logger.info(f"Categories failed: {self.stats['categories_failed']}")
            logger.info(f"Total papers fetched: {self.stats['total_fetched']}")
            logger.info(f"Total papers inserted: {self.stats['total_inserted']}")
            logger.info(f"Total duplicates: {self.stats['total_duplicates']}")
            logger.info(f"Total errors: {self.stats['total_errors']}")
            logger.info("=" * 80)
            
            return self._get_stats(start_time, success=True)
            
        except Exception as e:
            logger.error(f"Fatal error in scraping pipeline: {e}", exc_info=True)
            return self._get_stats(start_time, success=False, error=str(e))
        
        finally:
            # Cleanup
            logger.info("Closing database connection...")
            db_connection.close()
    
    def _process_category(self, category: str, papers: List[Dict]):
        """
        Process papers for a single category
        
        Args:
            category: Category name
            papers: List of paper dictionaries
        """
        logger.info(f"\nProcessing category: {category}")
        logger.info(f"Papers fetched: {len(papers)}")
        
        if not papers:
            logger.warning(f"No papers to process for category: {category}")
            self.stats['categories_failed'] += 1
            return
        
        try:
            # Update stats
            self.stats['total_fetched'] += len(papers)
            
            # Insert papers with deduplication
            result = self.deduplicator.insert_papers_bulk(papers)
            
            # Update stats
            self.stats['total_inserted'] += result['inserted']
            self.stats['total_duplicates'] += result['duplicates']
            self.stats['total_errors'] += result['errors']
            self.stats['categories_processed'] += 1
            
            logger.info(
                f"Category {category} results: "
                f"{result['inserted']} inserted, "
                f"{result['duplicates']} duplicates, "
                f"{result['errors']} errors"
            )
            
        except Exception as e:
            logger.error(f"Error processing category {category}: {e}", exc_info=True)
            self.stats['categories_failed'] += 1
    
    def _get_stats(self, start_time: datetime, success: bool, error: str = None) -> Dict:
        """
        Get final statistics dictionary
        
        Args:
            start_time: Pipeline start time
            success: Whether pipeline completed successfully
            error: Error message if failed
            
        Returns:
            Statistics dictionary
        """
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        return {
            "success": success,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "error": error,
            **self.stats
        }


def main():
    """Main entry point"""
    try:
        scraper = PaperScraper()
        result = scraper.run()
        
        # Exit with appropriate code
        sys.exit(0 if result['success'] else 1)
        
    except KeyboardInterrupt:
        logger.info("\nScraping interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
