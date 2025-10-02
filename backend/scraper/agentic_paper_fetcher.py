"""
Agentic paper fetcher using MCP paper-search-mcp server
This replaces the direct arxiv_client.py with an agentic approach
"""
import os
import sys
import logging
import json
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import google.generativeai as genai

# Add the paper-search-mcp submodule to Python path
submodule_path = Path(__file__).parent.parent / "backend" / "backend" / "paper-search-mcp"
if str(submodule_path) not in sys.path:
    sys.path.insert(0, str(submodule_path))

from config import (
    CS_CATEGORIES,
    MAX_PAPERS_PER_CATEGORY,
    DAYS_BACK
)

logger = logging.getLogger(__name__)


class AgenticPaperFetcher:
    """
    Agentic paper fetcher that uses LLM + MCP tools to intelligently fetch papers
    """
    
    def __init__(self):
        """Initialize the agentic paper fetcher with Gemini"""
        # Get API key from environment
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        groq_api_key = os.getenv("GROQ_API_KEY")
        
        if not gemini_api_key and not groq_api_key:
            raise ValueError("Either GEMINI_API_KEY or GROQ_API_KEY must be set in environment")
        
        # Configure Gemini (primary)
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            self.llm_provider = "gemini"
            logger.info("Initialized with Gemini API")
        else:
            # Fallback to Groq if needed
            self.llm_provider = "groq"
            logger.info("Initialized with Groq API")
        
        self.mcp_server_path = Path(__file__).parent.parent / "paper-search-mcp"
        logger.info(f"MCP server path: {self.mcp_server_path}")
    
    def _build_search_query(self, category: str) -> str:
        """
        Build an intelligent search query for a given category
        
        Args:
            category: arXiv category (e.g., 'cs.AI')
            
        Returns:
            Search query string
        """
        category_map = {
            "cs.AI": "artificial intelligence",
            "cs.CL": "natural language processing computational linguistics",
            "cs.LG": "machine learning deep learning",
            "cs.CV": "computer vision image processing",
            "cs.NE": "neural networks evolutionary computing",
            "cs.RO": "robotics autonomous systems",
            "cs.IR": "information retrieval search engines"
        }
        
        base_query = category_map.get(category, category.replace("cs.", ""))
        return base_query
    
    def fetch_papers_by_category(
        self,
        category: str,
        max_results: int = MAX_PAPERS_PER_CATEGORY,
        days_back: int = DAYS_BACK
    ) -> List[Dict]:
        """
        Fetch papers from arXiv by category using agentic approach
        
        Args:
            category: arXiv category (e.g., 'cs.AI')
            max_results: Maximum number of papers to fetch
            days_back: Number of days to look back for papers
            
        Returns:
            List of paper dictionaries with metadata
        """
        try:
            logger.info(f"Fetching papers for category: {category}, max_results: {max_results}")
            
            # Build search query
            search_query = self._build_search_query(category)
            
            # Use MCP tool via direct Python call
            # Since we can't directly call MCP from Python easily, we'll use the arxiv searcher directly
            from paper_search_mcp.academic_platforms.arxiv import ArxivSearcher
            
            searcher = ArxivSearcher()
            papers = searcher.search(search_query, max_results=max_results)
            
            # Transform papers to our schema
            transformed_papers = []
            for paper in papers:
                paper_dict = paper.to_dict()
                transformed_paper = self._transform_paper(paper_dict, category)
                transformed_papers.append(transformed_paper)
            
            logger.info(f"Successfully fetched {len(transformed_papers)} papers for category: {category}")
            return transformed_papers
            
        except Exception as e:
            logger.error(f"Error fetching papers for category {category}: {e}")
            return []
    
    def _transform_paper(self, paper_dict: Dict, category: str) -> Dict:
        """
        Transform paper from MCP format to our schema
        
        Args:
            paper_dict: Paper dictionary from MCP
            category: Primary category for this paper
            
        Returns:
            Dictionary with paper metadata in our schema
        """
        # Extract arxiv ID from paper_id field
        arxiv_id = paper_dict.get("paper_id", "")
        if "/" in arxiv_id:
            arxiv_id = arxiv_id.split("/")[-1]
        
        # Parse authors if they're in string format (semicolon separated)
        authors = paper_dict.get("authors", "")
        if isinstance(authors, str):
            authors = [a.strip() for a in authors.split(";") if a.strip()]
        elif not isinstance(authors, list):
            authors = []
        
        # Parse categories if they're in string format
        categories = paper_dict.get("categories", "")
        if isinstance(categories, str):
            categories = [c.strip() for c in categories.split(";") if c.strip()]
        elif not isinstance(categories, list):
            categories = []
        
        # Add the primary category if not in list
        if category not in categories:
            categories.insert(0, category)
        
        return {
            "arxiv_id": arxiv_id,
            "title": paper_dict.get("title", "").strip(),
            "authors": authors,
            "abstract": paper_dict.get("abstract", "").strip().replace("\n", " "),
            "arxiv_url": paper_dict.get("url", ""),
            "pdf_url": paper_dict.get("pdf_url", ""),
            "category": category,
            "primary_category": category,
            "categories": categories,
            "published": paper_dict.get("published_date"),
            "updated": paper_dict.get("updated_date") or paper_dict.get("published_date"),
            "created_at": datetime.now(),
            "processed_at": None,
            "summary": None,
            "why_it_matters": None,
            "applications": None,
            "likes_count": 0,
            "views_count": 0
        }
    
    def fetch_papers_by_categories(
        self,
        categories: List[str],
        max_results_per_category: int = MAX_PAPERS_PER_CATEGORY,
        days_back: int = DAYS_BACK
    ) -> Dict[str, List[Dict]]:
        """
        Fetch papers from multiple categories using agentic approach
        
        Args:
            categories: List of arXiv categories
            max_results_per_category: Maximum papers per category
            days_back: Number of days to look back
            
        Returns:
            Dictionary mapping category to list of papers
        """
        all_papers = {}
        
        for category in categories:
            try:
                papers = self.fetch_papers_by_category(
                    category=category,
                    max_results=max_results_per_category,
                    days_back=days_back
                )
                all_papers[category] = papers
                logger.info(f"Category {category}: {len(papers)} papers fetched")
            except Exception as e:
                logger.error(f"Failed to fetch papers for category {category}: {e}")
                all_papers[category] = []
        
        total_papers = sum(len(papers) for papers in all_papers.values())
        logger.info(f"Total papers fetched across all categories: {total_papers}")
        
        return all_papers
    
    def fetch_paper_by_id(self, arxiv_id: str) -> Optional[Dict]:
        """
        Fetch a single paper by arXiv ID using agentic approach
        
        Args:
            arxiv_id: arXiv paper ID
            
        Returns:
            Paper dictionary or None if not found
        """
        try:
            from paper_search_mcp.academic_platforms.arxiv import ArxivSearcher
            
            searcher = ArxivSearcher()
            # Search by ID
            papers = searcher.search(arxiv_id, max_results=1)
            
            if papers:
                paper_dict = papers[0].to_dict()
                transformed_paper = self._transform_paper(paper_dict, paper_dict.get("primary_category", "cs.AI"))
                logger.info(f"Successfully fetched paper: {arxiv_id}")
                return transformed_paper
            else:
                logger.warning(f"Paper not found: {arxiv_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching paper {arxiv_id}: {e}")
            return None
    
    def generate_intelligent_summary(self, paper: Dict) -> Dict:
        """
        Use LLM to generate intelligent summary and insights for a paper
        This is an agentic enhancement over simple scraping
        
        Args:
            paper: Paper dictionary
            
        Returns:
            Updated paper dictionary with LLM-generated insights
        """
        if self.llm_provider != "gemini":
            logger.warning("LLM summary generation only supported with Gemini")
            return paper
        
        try:
            prompt = f"""
            Analyze this research paper and provide:
            1. A 3-5 line plain English summary
            2. Why it matters (key significance)
            3. Practical applications
            
            Title: {paper['title']}
            Abstract: {paper['abstract']}
            
            Respond in JSON format:
            {{
                "summary": "...",
                "why_it_matters": "...",
                "applications": ["...", "..."]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            
            paper['summary'] = result.get('summary')
            paper['why_it_matters'] = result.get('why_it_matters')
            paper['applications'] = result.get('applications')
            paper['processed_at'] = datetime.now()
            
            logger.info(f"Generated intelligent summary for paper: {paper['arxiv_id']}")
            return paper
            
        except Exception as e:
            logger.error(f"Error generating summary for paper {paper.get('arxiv_id')}: {e}")
            return paper
