#!/usr/bin/env python3
"""
Paper Fetcher Script
Fetches papers from arXiv for all configured categories and saves to JSON file
"""
import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from agentic_paper_fetcher import AgenticPaperFetcher
from config import CS_CATEGORIES, MAX_PAPERS_PER_CATEGORY, DAYS_BACK

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/fetch_papers.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def fetch_all_papers(
    categories: list = None,
    max_papers_per_category: int = None,
    days_back: int = None,
    output_file: str = None
) -> dict:
    """
    Fetch papers from all configured categories
    
    Args:
        categories: List of arXiv categories (default: CS_CATEGORIES)
        max_papers_per_category: Max papers per category (default: MAX_PAPERS_PER_CATEGORY)
        days_back: Days to look back (default: DAYS_BACK)
        output_file: Output JSON file path (default: auto-generated)
        
    Returns:
        Dictionary with fetched papers and statistics
    """
    # Use defaults from config if not provided
    if categories is None:
        categories = CS_CATEGORIES
    if max_papers_per_category is None:
        max_papers_per_category = MAX_PAPERS_PER_CATEGORY
    if days_back is None:
        days_back = DAYS_BACK
    if output_file is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"logs/fetched_papers_{timestamp}.json"
    
    logger.info("=" * 80)
    logger.info("STARTING PAPER FETCHING")
    logger.info("=" * 80)
    logger.info(f"Categories: {categories}")
    logger.info(f"Max papers per category: {max_papers_per_category}")
    logger.info(f"Days back: {days_back}")
    logger.info(f"Output file: {output_file}")
    
    # Initialize fetcher
    try:
        fetcher = AgenticPaperFetcher()
        logger.info("Paper fetcher initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize paper fetcher: {e}")
        return {"error": str(e)}
    
    # Fetch papers
    start_time = datetime.now()
    stats = {
        "start_time": start_time.isoformat(),
        "categories": categories,
        "max_papers_per_category": max_papers_per_category,
        "days_back": days_back,
        "papers_by_category": {},
        "total_papers": 0,
        "errors": []
    }
    
    try:
        # Fetch papers for all categories
        all_papers = fetcher.fetch_papers_by_categories(
            categories=categories,
            max_results_per_category=max_papers_per_category,
            days_back=days_back
        )
        
        # Update statistics
        stats["papers_by_category"] = {
            category: len(papers) for category, papers in all_papers.items()
        }
        stats["total_papers"] = sum(len(papers) for papers in all_papers.values())
        
        # Flatten papers for output
        all_papers_flat = []
        for category, papers in all_papers.items():
            for paper in papers:
                paper["fetched_at"] = datetime.now().isoformat()
                all_papers_flat.append(paper)
        
        # Save to JSON file
        output_data = {
            "metadata": stats,
            "papers": all_papers_flat
        }
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        stats["end_time"] = end_time.isoformat()
        stats["duration_seconds"] = duration
        
        logger.info("=" * 80)
        logger.info("PAPER FETCHING COMPLETED")
        logger.info("=" * 80)
        logger.info(f"Total papers fetched: {stats['total_papers']}")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Output saved to: {output_file}")
        
        # Log per-category statistics
        for category, count in stats["papers_by_category"].items():
            logger.info(f"  {category}: {count} papers")
        
        return output_data
        
    except Exception as e:
        logger.error(f"Error during paper fetching: {e}", exc_info=True)
        stats["errors"].append(str(e))
        stats["end_time"] = datetime.now().isoformat()
        return {"error": str(e), "stats": stats}


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Fetch papers from arXiv")
    parser.add_argument(
        "--categories", 
        nargs="+", 
        default=CS_CATEGORIES,
        help=f"arXiv categories to fetch (default: {CS_CATEGORIES})"
    )
    parser.add_argument(
        "--max-papers", 
        type=int, 
        default=MAX_PAPERS_PER_CATEGORY,
        help=f"Maximum papers per category (default: {MAX_PAPERS_PER_CATEGORY})"
    )
    parser.add_argument(
        "--days-back", 
        type=int, 
        default=DAYS_BACK,
        help=f"Days to look back for papers (default: {DAYS_BACK})"
    )
    parser.add_argument(
        "--output", 
        type=str,
        help="Output JSON file path (default: auto-generated)"
    )
    
    args = parser.parse_args()
    
    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)
    
    # Fetch papers
    result = fetch_all_papers(
        categories=args.categories,
        max_papers_per_category=args.max_papers,
        days_back=args.days_back,
        output_file=args.output
    )
    
    if "error" in result:
        logger.error(f"Fetching failed: {result['error']}")
        sys.exit(1)
    else:
        logger.info("Paper fetching completed successfully")
        sys.exit(0)


if __name__ == "__main__":
    main()
