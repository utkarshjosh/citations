"""
Integrated Scraper with LangGraph Workflow
Combines paper fetching with LangGraph processing pipeline
"""
import logging
from typing import List, Dict
from datetime import datetime

from agentic_paper_fetcher import AgenticPaperFetcher
from paper_processing_workflow import PaperProcessingWorkflow
from db_connection import get_papers_collection
from deduplication import PaperDeduplicator
from config import CS_CATEGORIES, MAX_PAPERS_PER_CATEGORY, DAYS_BACK

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class IntegratedPaperPipeline:
    """
    Integrated pipeline that:
    1. Fetches papers from arXiv
    2. Deduplicates against database
    3. Processes through LangGraph workflow
    4. Stores in MongoDB
    """
    
    def __init__(self):
        """Initialize all components"""
        self.fetcher = AgenticPaperFetcher()
        self.workflow = PaperProcessingWorkflow()
        self.deduplicator = PaperDeduplicator()
        self.papers_collection = get_papers_collection()
        logger.info("Integrated pipeline initialized")
    
    def run_pipeline(
        self,
        categories: List[str] = None,
        max_papers_per_category: int = MAX_PAPERS_PER_CATEGORY,
        days_back: int = DAYS_BACK
    ) -> Dict:
        """
        Run the complete pipeline
        
        Args:
            categories: List of arXiv categories (default: CS_CATEGORIES)
            max_papers_per_category: Max papers per category
            days_back: Days to look back for papers
            
        Returns:
            Dictionary with pipeline statistics
        """
        if categories is None:
            categories = CS_CATEGORIES
        
        logger.info("=" * 80)
        logger.info("STARTING INTEGRATED PAPER PIPELINE")
        logger.info("=" * 80)
        logger.info(f"Categories: {categories}")
        logger.info(f"Max papers per category: {max_papers_per_category}")
        logger.info(f"Days back: {days_back}")
        
        stats = {
            'start_time': datetime.now(),
            'categories_processed': 0,
            'papers_fetched': 0,
            'papers_new': 0,
            'papers_duplicate': 0,
            'papers_processed': 0,
            'papers_stored': 0,
            'papers_failed': 0,
            'errors': []
        }
        
        try:
            # Step 1: Fetch papers
            logger.info("\n" + "=" * 80)
            logger.info("STEP 1: Fetching Papers from arXiv")
            logger.info("=" * 80)
            
            all_papers = self.fetcher.fetch_papers_by_categories(
                categories=categories,
                max_results_per_category=max_papers_per_category,
                days_back=days_back
            )
            
            stats['categories_processed'] = len(all_papers)
            stats['papers_fetched'] = sum(len(papers) for papers in all_papers.values())
            
            logger.info(f"✅ Fetched {stats['papers_fetched']} papers from {stats['categories_processed']} categories")
            
            # Step 2: Deduplicate
            logger.info("\n" + "=" * 80)
            logger.info("STEP 2: Deduplicating Papers")
            logger.info("=" * 80)
            
            all_papers_list = []
            for category_papers in all_papers.values():
                all_papers_list.extend(category_papers)
            
            new_papers = self.deduplicator.filter_new_papers(all_papers_list)
            
            stats['papers_new'] = len(new_papers)
            stats['papers_duplicate'] = stats['papers_fetched'] - stats['papers_new']
            
            logger.info(f"✅ New papers: {stats['papers_new']}")
            logger.info(f"ℹ️  Duplicates skipped: {stats['papers_duplicate']}")
            
            if not new_papers:
                logger.info("No new papers to process")
                stats['end_time'] = datetime.now()
                stats['duration'] = (stats['end_time'] - stats['start_time']).total_seconds()
                return stats
            
            # Step 3: Process through LangGraph workflow
            logger.info("\n" + "=" * 80)
            logger.info("STEP 3: Processing Papers through LangGraph Workflow")
            logger.info("=" * 80)
            
            processed_papers = self.workflow.process_papers_batch(new_papers)
            
            stats['papers_processed'] = len(processed_papers)
            
            # Step 4: Store in MongoDB
            logger.info("\n" + "=" * 80)
            logger.info("STEP 4: Storing Papers in MongoDB")
            logger.info("=" * 80)
            
            for paper in processed_papers:
                try:
                    # Prepare document for MongoDB
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
                    
                    # Insert into MongoDB
                    self.papers_collection.insert_one(paper_doc)
                    stats['papers_stored'] += 1
                    
                    logger.info(f"✅ Stored: {paper['arxiv_id']}")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to store {paper.get('arxiv_id')}: {e}")
                    stats['papers_failed'] += 1
                    stats['errors'].append(f"Storage error for {paper.get('arxiv_id')}: {str(e)}")
            
            # Final statistics
            stats['end_time'] = datetime.now()
            stats['duration'] = (stats['end_time'] - stats['start_time']).total_seconds()
            
            logger.info("\n" + "=" * 80)
            logger.info("PIPELINE COMPLETED")
            logger.info("=" * 80)
            logger.info(f"📊 Total papers fetched: {stats['papers_fetched']}")
            logger.info(f"🆕 New papers: {stats['papers_new']}")
            logger.info(f"♻️  Duplicates: {stats['papers_duplicate']}")
            logger.info(f"⚙️  Processed: {stats['papers_processed']}")
            logger.info(f"💾 Stored: {stats['papers_stored']}")
            logger.info(f"❌ Failed: {stats['papers_failed']}")
            logger.info(f"⏱️  Duration: {stats['duration']:.2f} seconds")
            
            if stats['errors']:
                logger.warning(f"\n⚠️  Errors encountered: {len(stats['errors'])}")
                for error in stats['errors'][:5]:  # Show first 5 errors
                    logger.warning(f"   - {error}")
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Pipeline failed: {e}", exc_info=True)
            stats['errors'].append(f"Pipeline error: {str(e)}")
            stats['end_time'] = datetime.now()
            stats['duration'] = (stats['end_time'] - stats['start_time']).total_seconds()
            return stats
    
    def process_single_paper(self, arxiv_id: str) -> Dict:
        """
        Process a single paper by arXiv ID
        
        Args:
            arxiv_id: arXiv paper ID
            
        Returns:
            Processed paper data
        """
        try:
            logger.info(f"Processing single paper: {arxiv_id}")
            
            # Fetch paper
            paper = self.fetcher.fetch_paper_by_id(arxiv_id)
            
            if not paper:
                logger.error(f"Paper not found: {arxiv_id}")
                return None
            
            # Check if already exists
            existing = self.papers_collection.find_one({'arxiv_id': arxiv_id})
            if existing:
                logger.info(f"Paper already exists in database: {arxiv_id}")
                return existing
            
            # Process through workflow
            processed_paper = self.workflow.process_paper(paper)
            
            # Store in database
            paper_doc = {
                'arxiv_id': processed_paper['arxiv_id'],
                'title': processed_paper['title'],
                'authors': processed_paper['authors'],
                'abstract': processed_paper['abstract'],
                'summary': processed_paper.get('summary'),
                'why_it_matters': processed_paper.get('why_it_matters'),
                'applications': processed_paper.get('applications', []),
                'category': processed_paper['category'],
                'pdf_url': processed_paper.get('pdf_url'),
                'arxiv_url': processed_paper.get('arxiv_url'),
                'published_date': processed_paper.get('published'),
                'processed': processed_paper.get('processed', False),
                'processed_at': processed_paper.get('processed_at'),
                'processing_errors': processed_paper.get('processing_errors', []),
                'likes_count': 0,
                'views_count': 0,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            self.papers_collection.insert_one(paper_doc)
            logger.info(f"✅ Successfully processed and stored: {arxiv_id}")
            
            return paper_doc
            
        except Exception as e:
            logger.error(f"Error processing paper {arxiv_id}: {e}", exc_info=True)
            return None


def main():
    """Main entry point"""
    pipeline = IntegratedPaperPipeline()
    
    # Run pipeline for all CS categories
    stats = pipeline.run_pipeline()
    
    # Print final summary
    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    print(f"Duration: {stats['duration']:.2f} seconds")
    print(f"Papers stored: {stats['papers_stored']}")
    print(f"Success rate: {stats['papers_stored']}/{stats['papers_new']} ({stats['papers_stored']/max(stats['papers_new'], 1)*100:.1f}%)")
    print("=" * 80)


if __name__ == "__main__":
    main()
