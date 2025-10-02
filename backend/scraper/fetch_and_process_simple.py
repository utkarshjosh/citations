#!/usr/bin/env python3
"""
Simple script to fetch 20 papers and process them using ArxivClient directly
"""
import logging
from datetime import datetime
from arxiv_client import ArxivClient
from paper_processing_workflow import PaperProcessingWorkflow
from db_connection import get_papers_collection
from deduplication import PaperDeduplicator
from config import CS_CATEGORIES

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Fetch and process 20 papers"""
    logger.info("=" * 80)
    logger.info("FETCHING AND PROCESSING 20 PAPERS (Simple Mode)")
    logger.info("=" * 80)
    
    # Initialize components
    arxiv_client = ArxivClient()
    workflow = PaperProcessingWorkflow()
    deduplicator = PaperDeduplicator()
    papers_collection = get_papers_collection()
    
    # Fetch 3 papers from each category (7 categories = ~21 papers)
    papers_per_category = 3
    days_back = 7
    
    logger.info(f"Fetching {papers_per_category} papers from each of {len(CS_CATEGORIES)} categories")
    logger.info(f"Looking back {days_back} days")
    
    # Step 1: Fetch papers
    logger.info("\n" + "=" * 80)
    logger.info("STEP 1: Fetching Papers from arXiv")
    logger.info("=" * 80)
    
    all_papers_dict = arxiv_client.fetch_papers_by_categories(
        categories=CS_CATEGORIES,
        max_results_per_category=papers_per_category,
        days_back=days_back
    )
    
    # Flatten to list
    all_papers = []
    for category_papers in all_papers_dict.values():
        all_papers.extend(category_papers)
    
    logger.info(f"✅ Fetched {len(all_papers)} papers total")
    
    if not all_papers:
        logger.warning("No papers fetched. Exiting.")
        return
    
    # Step 2: Deduplicate
    logger.info("\n" + "=" * 80)
    logger.info("STEP 2: Deduplicating Papers")
    logger.info("=" * 80)
    
    new_papers = deduplicator.filter_new_papers(all_papers)
    duplicates = len(all_papers) - len(new_papers)
    
    logger.info(f"✅ New papers: {len(new_papers)}")
    logger.info(f"♻️  Duplicates skipped: {duplicates}")
    
    if not new_papers:
        logger.info("No new papers to process")
        return
    
    # Step 3: Process through LangGraph workflow
    logger.info("\n" + "=" * 80)
    logger.info("STEP 3: Processing Papers through AI Workflow")
    logger.info("=" * 80)
    
    processed_papers = workflow.process_papers_batch(new_papers)
    
    # Step 4: Store in MongoDB
    logger.info("\n" + "=" * 80)
    logger.info("STEP 4: Storing Papers in MongoDB")
    logger.info("=" * 80)
    
    stored_count = 0
    failed_count = 0
    
    for paper in processed_papers:
        try:
            paper_doc = {
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
                'published_date': paper.get('published'),
                'processed': paper.get('processed', False),
                'processed_at': paper.get('processed_at'),
                'processing_errors': paper.get('processing_errors', []),
                'likes_count': 0,
                'views_count': 0,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            papers_collection.insert_one(paper_doc)
            stored_count += 1
            logger.info(f"✅ Stored: {paper['arxiv_id']} - {paper['title'][:60]}...")
            
        except Exception as e:
            logger.error(f"❌ Failed to store {paper.get('arxiv_id')}: {e}")
            failed_count += 1
    
    # Final summary
    print("\n" + "=" * 80)
    print("🎉 FETCH AND PROCESS COMPLETE")
    print("=" * 80)
    print(f"📥 Papers fetched: {len(all_papers)}")
    print(f"🆕 New papers: {len(new_papers)}")
    print(f"♻️  Duplicates skipped: {duplicates}")
    print(f"⚙️  Papers processed: {len(processed_papers)}")
    print(f"💾 Papers stored: {stored_count}")
    print(f"❌ Failed: {failed_count}")
    
    if stored_count > 0:
        print(f"\n✅ Success! {stored_count} papers are now available with AI summaries!")
    
    print("=" * 80)


if __name__ == "__main__":
    main()
