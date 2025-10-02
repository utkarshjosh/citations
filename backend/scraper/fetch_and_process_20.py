#!/usr/bin/env python3
"""
Fetch 20 random papers from arXiv and process them all through the AI workflow
"""
import logging
from integrated_scraper import IntegratedPaperPipeline
from config import CS_CATEGORIES

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Fetch and process 20 papers"""
    logger.info("=" * 80)
    logger.info("FETCHING AND PROCESSING 20 PAPERS")
    logger.info("=" * 80)
    
    # Initialize pipeline
    pipeline = IntegratedPaperPipeline()
    
    # Fetch ~20 papers by getting 3 papers from each of the 7 categories
    # This will give us approximately 21 papers total
    papers_per_category = 3
    
    logger.info(f"Fetching {papers_per_category} papers from each of {len(CS_CATEGORIES)} categories")
    logger.info(f"Expected total: ~{papers_per_category * len(CS_CATEGORIES)} papers")
    
    # Run the pipeline
    stats = pipeline.run_pipeline(
        categories=CS_CATEGORIES,
        max_papers_per_category=papers_per_category,
        days_back=7  # Look back 7 days to get more variety
    )
    
    # Print summary
    print("\n" + "=" * 80)
    print("🎉 FETCH AND PROCESS COMPLETE")
    print("=" * 80)
    print(f"📥 Papers fetched: {stats['papers_fetched']}")
    print(f"🆕 New papers: {stats['papers_new']}")
    print(f"♻️  Duplicates skipped: {stats['papers_duplicate']}")
    print(f"⚙️  Papers processed: {stats['papers_processed']}")
    print(f"💾 Papers stored: {stats['papers_stored']}")
    print(f"❌ Failed: {stats['papers_failed']}")
    print(f"⏱️  Duration: {stats['duration']:.2f} seconds ({stats['duration']/60:.1f} minutes)")
    
    if stats['papers_stored'] > 0:
        print(f"\n✅ Success! {stats['papers_stored']} papers are now available in the database")
        print("   with AI-generated summaries, insights, and applications!")
    else:
        print("\n⚠️  No new papers were stored (all may have been duplicates)")
    
    print("=" * 80)
    
    return stats


if __name__ == "__main__":
    main()
