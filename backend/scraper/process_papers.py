#!/usr/bin/env python3
"""
Paper Processing Script
Processes fetched papers through LangGraph workflow and stores in MongoDB
"""
import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from paper_processing_workflow import PaperProcessingWorkflow
from db_connection import get_papers_collection
from deduplication import PaperDeduplicator
from config import MONGODB_DB_NAME

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/process_papers.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def process_papers_from_file(
    input_file: str,
    output_file: str = None,
    store_in_db: bool = True,
    skip_duplicates: bool = True
) -> dict:
    """
    Process papers from a JSON file through the LangGraph workflow
    
    Args:
        input_file: Path to JSON file with fetched papers
        output_file: Path to save processed papers (default: auto-generated)
        store_in_db: Whether to store processed papers in MongoDB
        skip_duplicates: Whether to skip papers that already exist in database
        
    Returns:
        Dictionary with processing statistics
    """
    logger.info("=" * 80)
    logger.info("STARTING PAPER PROCESSING")
    logger.info("=" * 80)
    logger.info(f"Input file: {input_file}")
    logger.info(f"Store in database: {store_in_db}")
    logger.info(f"Skip duplicates: {skip_duplicates}")
    
    # Load papers from file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        papers = data.get("papers", [])
        if not papers:
            logger.warning("No papers found in input file")
            return {"error": "No papers found in input file"}
        
        logger.info(f"Loaded {len(papers)} papers from {input_file}")
        
    except Exception as e:
        logger.error(f"Error loading input file: {e}")
        return {"error": f"Error loading input file: {e}"}
    
    # Initialize components
    try:
        workflow = PaperProcessingWorkflow()
        deduplicator = PaperDeduplicator()
        papers_collection = get_papers_collection() if store_in_db else None
        logger.info("Processing components initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize processing components: {e}")
        return {"error": f"Failed to initialize components: {e}"}
    
    # Processing statistics
    start_time = datetime.now()
    stats = {
        "start_time": start_time.isoformat(),
        "input_file": input_file,
        "total_papers": len(papers),
        "papers_processed": 0,
        "papers_stored": 0,
        "papers_duplicate": 0,
        "papers_failed": 0,
        "errors": []
    }
    
    try:
        # Step 1: Deduplicate if requested
        if skip_duplicates and store_in_db:
            logger.info("Checking for duplicates in database...")
            new_papers = deduplicator.filter_new_papers(papers)
            stats["papers_duplicate"] = len(papers) - len(new_papers)
            papers = new_papers
            logger.info(f"After deduplication: {len(papers)} new papers to process")
        
        if not papers:
            logger.info("No new papers to process after deduplication")
            stats["end_time"] = datetime.now().isoformat()
            stats["duration_seconds"] = (datetime.now() - start_time).total_seconds()
            return stats
        
        # Step 2: Process papers through LangGraph workflow
        logger.info("Processing papers through LangGraph workflow...")
        processed_papers = workflow.process_papers_batch(papers)
        stats["papers_processed"] = len(processed_papers)
        
        # Step 3: Store in database if requested
        if store_in_db:
            logger.info("Storing processed papers in MongoDB...")
            for paper in processed_papers:
                try:
                    # Prepare document for MongoDB
                    paper_doc = _prepare_paper_document(paper)
                    
                    # Insert into MongoDB
                    papers_collection.insert_one(paper_doc)
                    stats["papers_stored"] += 1
                    
                    logger.info(f"✅ Stored: {paper['arxiv_id']}")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to store {paper.get('arxiv_id')}: {e}")
                    stats["papers_failed"] += 1
                    stats["errors"].append(f"Storage error for {paper.get('arxiv_id')}: {str(e)}")
        
        # Step 4: Save processed papers to file
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"logs/processed_papers_{timestamp}.json"
        
        output_data = {
            "metadata": {
                **stats,
                "processing_completed_at": datetime.now().isoformat()
            },
            "papers": processed_papers
        }
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False, default=str)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        stats["end_time"] = end_time.isoformat()
        stats["duration_seconds"] = duration
        stats["output_file"] = output_file
        
        logger.info("=" * 80)
        logger.info("PAPER PROCESSING COMPLETED")
        logger.info("=" * 80)
        logger.info(f"Total papers: {stats['total_papers']}")
        logger.info(f"New papers: {len(papers)}")
        logger.info(f"Duplicates skipped: {stats['papers_duplicate']}")
        logger.info(f"Processed: {stats['papers_processed']}")
        logger.info(f"Stored in DB: {stats['papers_stored']}")
        logger.info(f"Failed: {stats['papers_failed']}")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Output saved to: {output_file}")
        
        if stats['errors']:
            logger.warning(f"\n⚠️  Errors encountered: {len(stats['errors'])}")
            for error in stats['errors'][:5]:  # Show first 5 errors
                logger.warning(f"   - {error}")
        
        return stats
        
    except Exception as e:
        logger.error(f"Error during paper processing: {e}", exc_info=True)
        stats["errors"].append(f"Processing error: {str(e)}")
        stats["end_time"] = datetime.now().isoformat()
        stats["duration_seconds"] = (datetime.now() - start_time).total_seconds()
        return stats


def _prepare_paper_document(paper: Dict) -> Dict:
    """
    Prepare a paper document for MongoDB storage
    
    Args:
        paper: Processed paper dictionary
        
    Returns:
        Document ready for MongoDB insertion
    """
    # Convert published_date string to Date object if present
    published_date = paper.get('published')
    if published_date and isinstance(published_date, str):
        try:
            published_date = datetime.fromisoformat(published_date.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            logger.warning(f"Invalid published_date format for {paper['arxiv_id']}: {published_date}")
            published_date = None
    elif published_date and isinstance(published_date, datetime):
        # Already a datetime object, keep as is
        pass
    else:
        published_date = None
    
    return {
        'arxiv_id': paper['arxiv_id'],
        'title': paper['title'],
        'authors': paper['authors'],
        'abstract': paper['abstract'],
        'summary': paper.get('summary'),
        'why_it_matters': paper.get('why_it_matters'),
        'applications': paper.get('applications', []),
        'category': paper['category'],
        'pdf_url': paper.get('pdf_url'),
        'arxiv_url': paper.get('arxiv_url'),
        'published_date': published_date,
        'processed': paper.get('processed', False),
        'processed_at': paper.get('processed_at'),
        'processing_errors': paper.get('processing_errors', []),
        'likes_count': 0,
        'views_count': 0,
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }


def process_single_paper(arxiv_id: str, store_in_db: bool = True) -> Dict:
    """
    Process a single paper by arXiv ID
    
    Args:
        arxiv_id: arXiv paper ID
        store_in_db: Whether to store in MongoDB
        
    Returns:
        Processed paper data or None if failed
    """
    logger.info(f"Processing single paper: {arxiv_id}")
    
    try:
        # Initialize components
        workflow = PaperProcessingWorkflow()
        papers_collection = get_papers_collection() if store_in_db else None
        
        # Check if already exists
        if store_in_db:
            existing = papers_collection.find_one({'arxiv_id': arxiv_id})
            if existing:
                logger.info(f"Paper already exists in database: {arxiv_id}")
                return existing
        
        # Fetch paper (this would need to be implemented or use existing fetcher)
        # For now, we'll assume the paper data is provided
        logger.warning("Single paper processing requires paper data - use process_papers_from_file instead")
        return None
        
    except Exception as e:
        logger.error(f"Error processing paper {arxiv_id}: {e}", exc_info=True)
        return None


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Process papers through LangGraph workflow")
    parser.add_argument(
        "input_file",
        help="Path to JSON file with fetched papers"
    )
    parser.add_argument(
        "--output",
        help="Output JSON file path (default: auto-generated)"
    )
    parser.add_argument(
        "--no-db",
        action="store_true",
        help="Don't store processed papers in MongoDB"
    )
    parser.add_argument(
        "--no-dedup",
        action="store_true",
        help="Don't skip duplicate papers"
    )
    parser.add_argument(
        "--single",
        help="Process a single paper by arXiv ID"
    )
    
    args = parser.parse_args()
    
    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)
    
    # Process single paper if requested
    if args.single:
        result = process_single_paper(args.single, store_in_db=not args.no_db)
        if result:
            logger.info("Single paper processing completed successfully")
            sys.exit(0)
        else:
            logger.error("Single paper processing failed")
            sys.exit(1)
    
    # Process papers from file
    if not os.path.exists(args.input_file):
        logger.error(f"Input file not found: {args.input_file}")
        sys.exit(1)
    
    result = process_papers_from_file(
        input_file=args.input_file,
        output_file=args.output,
        store_in_db=not args.no_db,
        skip_duplicates=not args.no_dedup
    )
    
    if "error" in result:
        logger.error(f"Processing failed: {result['error']}")
        sys.exit(1)
    else:
        logger.info("Paper processing completed successfully")
        sys.exit(0)


if __name__ == "__main__":
    main()
