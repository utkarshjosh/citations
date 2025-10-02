"""
Deduplication module to prevent storing duplicate papers
"""
import logging
from typing import List, Dict, Set
from pymongo.errors import DuplicateKeyError

from db_connection import get_papers_collection

logger = logging.getLogger(__name__)


class PaperDeduplicator:
    """Handles deduplication of papers based on arxiv_id"""
    
    def __init__(self):
        self.papers_collection = get_papers_collection()
    
    def check_exists(self, arxiv_id: str) -> bool:
        """
        Check if a paper already exists in the database
        
        Args:
            arxiv_id: arXiv paper ID
            
        Returns:
            True if paper exists, False otherwise
        """
        try:
            result = self.papers_collection.find_one(
                {"arxiv_id": arxiv_id},
                {"_id": 1}
            )
            return result is not None
        except Exception as e:
            logger.error(f"Error checking if paper exists: {e}")
            return False
    
    def get_existing_ids(self, arxiv_ids: List[str]) -> Set[str]:
        """
        Get set of arxiv_ids that already exist in database
        
        Args:
            arxiv_ids: List of arXiv paper IDs to check
            
        Returns:
            Set of arxiv_ids that exist in database
        """
        try:
            if not arxiv_ids:
                return set()
            
            # Bulk query for efficiency
            cursor = self.papers_collection.find(
                {"arxiv_id": {"$in": arxiv_ids}},
                {"arxiv_id": 1, "_id": 0}
            )
            
            existing_ids = {doc["arxiv_id"] for doc in cursor}
            logger.info(f"Found {len(existing_ids)} existing papers out of {len(arxiv_ids)} checked")
            
            return existing_ids
            
        except Exception as e:
            logger.error(f"Error getting existing IDs: {e}")
            return set()
    
    def filter_new_papers(self, papers: List[Dict]) -> List[Dict]:
        """
        Filter out papers that already exist in database
        
        Args:
            papers: List of paper dictionaries
            
        Returns:
            List of papers that don't exist in database
        """
        if not papers:
            return []
        
        # Extract arxiv_ids
        arxiv_ids = [paper["arxiv_id"] for paper in papers]
        
        # Get existing IDs
        existing_ids = self.get_existing_ids(arxiv_ids)
        
        # Filter out existing papers
        new_papers = [
            paper for paper in papers
            if paper["arxiv_id"] not in existing_ids
        ]
        
        logger.info(
            f"Filtered papers: {len(papers)} total, "
            f"{len(existing_ids)} duplicates, "
            f"{len(new_papers)} new"
        )
        
        return new_papers
    
    def insert_paper(self, paper: Dict) -> bool:
        """
        Insert a single paper, handling duplicates gracefully
        
        Args:
            paper: Paper dictionary
            
        Returns:
            True if inserted successfully, False if duplicate or error
        """
        try:
            self.papers_collection.insert_one(paper)
            logger.debug(f"Inserted paper: {paper['arxiv_id']}")
            return True
            
        except DuplicateKeyError:
            logger.debug(f"Duplicate paper skipped: {paper['arxiv_id']}")
            return False
            
        except Exception as e:
            logger.error(f"Error inserting paper {paper.get('arxiv_id', 'unknown')}: {e}")
            return False
    
    def insert_papers_bulk(self, papers: List[Dict]) -> Dict[str, int]:
        """
        Insert multiple papers in bulk, handling duplicates
        
        Args:
            papers: List of paper dictionaries
            
        Returns:
            Dictionary with counts: {"inserted": int, "duplicates": int, "errors": int}
        """
        if not papers:
            return {"inserted": 0, "duplicates": 0, "errors": 0}
        
        # First filter out known duplicates
        new_papers = self.filter_new_papers(papers)
        
        if not new_papers:
            logger.info("No new papers to insert (all duplicates)")
            return {
                "inserted": 0,
                "duplicates": len(papers),
                "errors": 0
            }
        
        # Attempt bulk insert with ordered=False to continue on errors
        try:
            result = self.papers_collection.insert_many(
                new_papers,
                ordered=False  # Continue inserting even if some fail
            )
            inserted_count = len(result.inserted_ids)
            
            logger.info(f"Bulk insert: {inserted_count} papers inserted successfully")
            
            return {
                "inserted": inserted_count,
                "duplicates": len(papers) - len(new_papers),
                "errors": len(new_papers) - inserted_count
            }
            
        except Exception as e:
            # Even with errors, some documents may have been inserted
            logger.error(f"Error during bulk insert: {e}")
            
            # Fall back to individual inserts for remaining papers
            return self._fallback_individual_inserts(new_papers)
    
    def _fallback_individual_inserts(self, papers: List[Dict]) -> Dict[str, int]:
        """
        Fallback method: insert papers one by one
        
        Args:
            papers: List of paper dictionaries
            
        Returns:
            Dictionary with counts
        """
        logger.info("Falling back to individual inserts")
        
        inserted = 0
        duplicates = 0
        errors = 0
        
        for paper in papers:
            try:
                self.papers_collection.insert_one(paper)
                inserted += 1
            except DuplicateKeyError:
                duplicates += 1
            except Exception as e:
                logger.error(f"Error inserting paper {paper.get('arxiv_id', 'unknown')}: {e}")
                errors += 1
        
        logger.info(
            f"Individual inserts completed: "
            f"{inserted} inserted, {duplicates} duplicates, {errors} errors"
        )
        
        return {
            "inserted": inserted,
            "duplicates": duplicates,
            "errors": errors
        }
    
    def update_paper(self, arxiv_id: str, update_data: Dict) -> bool:
        """
        Update an existing paper
        
        Args:
            arxiv_id: arXiv paper ID
            update_data: Dictionary with fields to update
            
        Returns:
            True if updated successfully, False otherwise
        """
        try:
            result = self.papers_collection.update_one(
                {"arxiv_id": arxiv_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                logger.debug(f"Updated paper: {arxiv_id}")
                return True
            else:
                logger.debug(f"No changes for paper: {arxiv_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating paper {arxiv_id}: {e}")
            return False
