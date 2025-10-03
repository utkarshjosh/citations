#!/usr/bin/env python3
"""
Complete Paper Pipeline Runner
Runs the full pipeline: fetch papers -> process papers -> store in database
"""
import os
import sys
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from config import CS_CATEGORIES, MAX_PAPERS_PER_CATEGORY, DAYS_BACK

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def run_complete_pipeline(
    categories: list = None,
    max_papers_per_category: int = None,
    days_back: int = None,
    skip_fetch: bool = False,
    skip_process: bool = False,
    input_file: str = None
) -> dict:
    """
    Run the complete paper pipeline
    
    Args:
        categories: List of arXiv categories
        max_papers_per_category: Max papers per category
        days_back: Days to look back
        skip_fetch: Skip the fetching step
        skip_process: Skip the processing step
        input_file: Use this file instead of fetching new papers
        
    Returns:
        Dictionary with pipeline results
    """
    # Use defaults from config if not provided
    if categories is None:
        categories = CS_CATEGORIES
    if max_papers_per_category is None:
        max_papers_per_category = MAX_PAPERS_PER_CATEGORY
    if days_back is None:
        days_back = DAYS_BACK
    
    logger.info("=" * 80)
    logger.info("STARTING COMPLETE PAPER PIPELINE")
    logger.info("=" * 80)
    logger.info(f"Categories: {categories}")
    logger.info(f"Max papers per category: {max_papers_per_category}")
    logger.info(f"Days back: {days_back}")
    logger.info(f"Skip fetch: {skip_fetch}")
    logger.info(f"Skip process: {skip_process}")
    
    pipeline_stats = {
        "start_time": datetime.now().isoformat(),
        "categories": categories,
        "max_papers_per_category": max_papers_per_category,
        "days_back": days_back,
        "fetch_results": None,
        "process_results": None,
        "errors": []
    }
    
    try:
        # Step 1: Fetch papers (unless skipped)
        fetched_file = input_file
        if not skip_fetch:
            logger.info("\n" + "=" * 80)
            logger.info("STEP 1: FETCHING PAPERS")
            logger.info("=" * 80)
            
            # Build command for fetch_papers.py
            fetch_cmd = [
                sys.executable, "fetch_papers.py",
                "--max-papers", str(max_papers_per_category),
                "--days-back", str(days_back)
            ]
            
            # Add categories if not using defaults
            if categories != CS_CATEGORIES:
                fetch_cmd.extend(["--categories"] + categories)
            
            # Run fetch command
            result = subprocess.run(fetch_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                error_msg = f"Fetch step failed: {result.stderr}"
                logger.error(error_msg)
                pipeline_stats["errors"].append(error_msg)
                return pipeline_stats
            
            # Extract output file from logs
            log_lines = result.stdout.split('\n')
            for line in log_lines:
                if "Output saved to:" in line:
                    fetched_file = line.split("Output saved to:")[-1].strip()
                    break
            
            if not fetched_file or not os.path.exists(fetched_file):
                error_msg = "Could not determine output file from fetch step"
                logger.error(error_msg)
                pipeline_stats["errors"].append(error_msg)
                return pipeline_stats
            
            logger.info(f"✅ Papers fetched and saved to: {fetched_file}")
            pipeline_stats["fetch_results"] = {"output_file": fetched_file}
        
        # Step 2: Process papers (unless skipped)
        if not skip_process:
            logger.info("\n" + "=" * 80)
            logger.info("STEP 2: PROCESSING PAPERS")
            logger.info("=" * 80)
            
            if not fetched_file:
                error_msg = "No input file available for processing step"
                logger.error(error_msg)
                pipeline_stats["errors"].append(error_msg)
                return pipeline_stats
            
            # Build command for process_papers.py
            process_cmd = [
                sys.executable, "process_papers.py",
                fetched_file
            ]
            
            # Run process command
            result = subprocess.run(process_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                error_msg = f"Process step failed: {result.stderr}"
                logger.error(error_msg)
                pipeline_stats["errors"].append(error_msg)
                return pipeline_stats
            
            # Extract output file from logs
            log_lines = result.stdout.split('\n')
            processed_file = None
            for line in log_lines:
                if "Output saved to:" in line:
                    processed_file = line.split("Output saved to:")[-1].strip()
                    break
            
            logger.info(f"✅ Papers processed and saved to: {processed_file}")
            pipeline_stats["process_results"] = {"output_file": processed_file}
        
        # Final statistics
        end_time = datetime.now()
        duration = (datetime.fromisoformat(pipeline_stats["start_time"]) - end_time).total_seconds()
        pipeline_stats["end_time"] = end_time.isoformat()
        pipeline_stats["duration_seconds"] = abs(duration)
        
        logger.info("\n" + "=" * 80)
        logger.info("PIPELINE COMPLETED")
        logger.info("=" * 80)
        logger.info(f"Duration: {abs(duration):.2f} seconds")
        
        if pipeline_stats["fetch_results"]:
            logger.info(f"Fetched papers: {pipeline_stats['fetch_results']['output_file']}")
        if pipeline_stats["process_results"]:
            logger.info(f"Processed papers: {pipeline_stats['process_results']['output_file']}")
        
        return pipeline_stats
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        pipeline_stats["errors"].append(f"Pipeline error: {str(e)}")
        pipeline_stats["end_time"] = datetime.now().isoformat()
        return pipeline_stats


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run complete paper pipeline")
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
        "--skip-fetch",
        action="store_true",
        help="Skip the paper fetching step"
    )
    parser.add_argument(
        "--skip-process",
        action="store_true",
        help="Skip the paper processing step"
    )
    parser.add_argument(
        "--input-file",
        help="Use this file as input instead of fetching new papers"
    )
    
    args = parser.parse_args()
    
    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)
    
    # Run pipeline
    result = run_complete_pipeline(
        categories=args.categories,
        max_papers_per_category=args.max_papers,
        days_back=args.days_back,
        skip_fetch=args.skip_fetch,
        skip_process=args.skip_process,
        input_file=args.input_file
    )
    
    if result["errors"]:
        logger.error(f"Pipeline failed with {len(result['errors'])} errors")
        for error in result["errors"]:
            logger.error(f"  - {error}")
        sys.exit(1)
    else:
        logger.info("Pipeline completed successfully")
        sys.exit(0)


if __name__ == "__main__":
    main()
