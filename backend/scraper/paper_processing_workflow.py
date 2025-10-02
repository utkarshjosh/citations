"""
LangGraph Workflow for Paper Processing Pipeline
Orchestrates the processing of research papers through multiple LLM nodes
"""
import os
import logging
from typing import Dict, List, TypedDict, Annotated
from datetime import datetime
import operator

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)


class PaperState(TypedDict):
    """
    State object that flows through the workflow
    Contains all paper data and processing status
    """
    # Paper metadata
    arxiv_id: str
    title: str
    authors: List[str]
    abstract: str
    category: str
    pdf_url: str
    arxiv_url: str
    published_date: str
    
    # Processing fields
    summary: str
    why_it_matters: str
    applications: List[str]
    
    # Workflow control
    processed: bool
    processing_errors: Annotated[List[str], operator.add]
    current_node: str
    
    # Timestamps
    created_at: datetime
    processed_at: datetime


class PaperProcessingWorkflow:
    """
    LangGraph workflow for processing research papers
    """
    
    def __init__(self):
        """Initialize the workflow with LLM and graph structure"""
        self.llm = self._initialize_llm()
        self.graph = self._build_graph()
        self.app = self.graph.compile()
        logger.info("Paper processing workflow initialized")
    
    def _initialize_llm(self):
        """
        Initialize LLM provider (Gemini or Groq)
        
        Returns:
            LLM instance
        """
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        groq_api_key = os.getenv("GROQ_API_KEY")
        
        if gemini_api_key:
            logger.info("Initializing Gemini LLM")
            return ChatGoogleGenerativeAI(
                model="gemini-2.0-flash-exp",
                google_api_key=gemini_api_key,
                temperature=0.7,
                max_output_tokens=2048
            )
        elif groq_api_key:
            logger.info("Initializing Groq LLM")
            return ChatGroq(
                model="llama-3.3-70b-versatile",
                groq_api_key=groq_api_key,
                temperature=0.7,
                max_tokens=2048
            )
        else:
            raise ValueError("Either GEMINI_API_KEY or GROQ_API_KEY must be set")
    
    def _build_graph(self) -> StateGraph:
        """
        Build the LangGraph workflow structure
        
        Returns:
            StateGraph instance
        """
        # Create graph with PaperState
        workflow = StateGraph(PaperState)
        
        # Add nodes
        workflow.add_node("ingestion", self.ingestion_node)
        workflow.add_node("summary_generation", self.summary_generation_node)
        workflow.add_node("why_it_matters", self.why_it_matters_node)
        workflow.add_node("applications", self.applications_node)
        workflow.add_node("quality_validation", self.quality_validation_node)
        
        # Define edges (workflow flow)
        workflow.set_entry_point("ingestion")
        workflow.add_edge("ingestion", "summary_generation")
        workflow.add_edge("summary_generation", "why_it_matters")
        workflow.add_edge("why_it_matters", "applications")
        workflow.add_edge("applications", "quality_validation")
        workflow.add_edge("quality_validation", END)
        
        return workflow
    
    def ingestion_node(self, state: PaperState) -> PaperState:
        """
        Node 1: Paper ingestion and validation
        Validates input data and prepares for processing
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state
        """
        try:
            logger.info(f"Ingestion node: Processing paper {state.get('arxiv_id')}")
            
            # Validate required fields
            required_fields = ['arxiv_id', 'title', 'abstract']
            missing_fields = [f for f in required_fields if not state.get(f)]
            
            if missing_fields:
                error_msg = f"Missing required fields: {', '.join(missing_fields)}"
                logger.error(error_msg)
                state['processing_errors'] = [error_msg]
                state['processed'] = False
                return state
            
            # Initialize processing fields
            state['current_node'] = 'ingestion'
            state['processed'] = False
            state['processing_errors'] = []
            
            if 'created_at' not in state:
                state['created_at'] = datetime.now()
            
            logger.info(f"Ingestion complete for paper: {state['arxiv_id']}")
            return state
            
        except Exception as e:
            logger.error(f"Error in ingestion node: {e}")
            state['processing_errors'] = [f"Ingestion error: {str(e)}"]
            return state
    
    def summary_generation_node(self, state: PaperState) -> PaperState:
        """
        Node 2: Generate plain English summary (3-5 lines)
        Uses LLM to create accessible summary
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with summary
        """
        try:
            logger.info(f"Summary generation node: Processing {state['arxiv_id']}")
            state['current_node'] = 'summary_generation'
            
            # Skip if previous errors
            if state.get('processing_errors'):
                logger.warning(f"Skipping summary generation due to previous errors")
                return state
            
            prompt = f"""
You are a research paper summarizer. Create a clear, plain English summary of this paper.

Title: {state['title']}
Abstract: {state['abstract']}

Requirements:
- Write 3-5 lines maximum
- Use simple, accessible language
- Focus on the main contribution and findings
- Avoid technical jargon where possible
- Make it engaging and easy to understand

Provide ONLY the summary text, no additional formatting or labels.
"""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            summary = response.content.strip()
            
            state['summary'] = summary
            logger.info(f"Summary generated for paper: {state['arxiv_id']}")
            
            return state
            
        except Exception as e:
            logger.error(f"Error in summary generation node: {e}")
            state['processing_errors'].append(f"Summary generation error: {str(e)}")
            return state
    
    def why_it_matters_node(self, state: PaperState) -> PaperState:
        """
        Node 3: Extract "why it matters" insights
        Explains the significance and impact of the research
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with why_it_matters
        """
        try:
            logger.info(f"Why it matters node: Processing {state['arxiv_id']}")
            state['current_node'] = 'why_it_matters'
            
            # Skip if previous errors
            if state.get('processing_errors'):
                logger.warning(f"Skipping why_it_matters due to previous errors")
                return state
            
            prompt = f"""
You are a research impact analyst. Explain why this research matters.

Title: {state['title']}
Abstract: {state['abstract']}
Summary: {state.get('summary', '')}

Requirements:
- Explain the significance and potential impact
- Write 2-4 sentences
- Focus on real-world implications
- Be specific about who benefits and how
- Use clear, compelling language

Provide ONLY the explanation text, no additional formatting or labels.
"""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            why_it_matters = response.content.strip()
            
            state['why_it_matters'] = why_it_matters
            logger.info(f"Why it matters generated for paper: {state['arxiv_id']}")
            
            return state
            
        except Exception as e:
            logger.error(f"Error in why_it_matters node: {e}")
            state['processing_errors'].append(f"Why it matters error: {str(e)}")
            return state
    
    def applications_node(self, state: PaperState) -> PaperState:
        """
        Node 4: Identify practical applications
        Extracts concrete use cases and applications
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with applications list
        """
        try:
            logger.info(f"Applications node: Processing {state['arxiv_id']}")
            state['current_node'] = 'applications'
            
            # Skip if previous errors
            if state.get('processing_errors'):
                logger.warning(f"Skipping applications due to previous errors")
                return state
            
            prompt = f"""
You are a technology applications expert. Identify practical applications for this research.

Title: {state['title']}
Abstract: {state['abstract']}
Summary: {state.get('summary', '')}

Requirements:
- List 3-5 specific, practical applications
- Focus on real-world use cases
- Be concrete and specific
- Each application should be 1-2 sentences
- Format as a JSON array of strings

Example format:
["Application 1 description", "Application 2 description", "Application 3 description"]

Provide ONLY the JSON array, no additional text or formatting.
"""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            applications_text = response.content.strip()
            
            # Parse JSON response
            import json
            try:
                # Remove markdown code blocks if present
                if applications_text.startswith('```'):
                    applications_text = applications_text.split('```')[1]
                    if applications_text.startswith('json'):
                        applications_text = applications_text[4:]
                applications_text = applications_text.strip()
                
                applications = json.loads(applications_text)
                if not isinstance(applications, list):
                    applications = [applications_text]
            except json.JSONDecodeError:
                # Fallback: split by newlines or bullet points
                applications = [
                    line.strip().lstrip('•-*').strip() 
                    for line in applications_text.split('\n') 
                    if line.strip()
                ][:5]
            
            state['applications'] = applications
            logger.info(f"Applications generated for paper: {state['arxiv_id']}")
            
            return state
            
        except Exception as e:
            logger.error(f"Error in applications node: {e}")
            state['processing_errors'].append(f"Applications error: {str(e)}")
            return state
    
    def quality_validation_node(self, state: PaperState) -> PaperState:
        """
        Node 5: Quality validation and finalization
        Validates all generated content and marks as processed
        
        Args:
            state: Current workflow state
            
        Returns:
            Final state with processing status
        """
        try:
            logger.info(f"Quality validation node: Processing {state['arxiv_id']}")
            state['current_node'] = 'quality_validation'
            
            # Check if all required fields are present
            validation_errors = []
            
            if not state.get('summary'):
                validation_errors.append("Summary is missing")
            elif len(state['summary']) < 50:
                validation_errors.append("Summary is too short")
            
            if not state.get('why_it_matters'):
                validation_errors.append("Why it matters is missing")
            
            if not state.get('applications') or len(state['applications']) == 0:
                validation_errors.append("Applications are missing")
            
            # Update state based on validation
            if validation_errors:
                logger.warning(f"Validation failed for {state['arxiv_id']}: {validation_errors}")
                state['processing_errors'].extend(validation_errors)
                state['processed'] = False
            else:
                logger.info(f"Quality validation passed for {state['arxiv_id']}")
                state['processed'] = True
                state['processed_at'] = datetime.now()
            
            return state
            
        except Exception as e:
            logger.error(f"Error in quality validation node: {e}")
            state['processing_errors'].append(f"Quality validation error: {str(e)}")
            state['processed'] = False
            return state
    
    def process_paper(self, paper_data: Dict) -> Dict:
        """
        Process a single paper through the workflow
        
        Args:
            paper_data: Dictionary with paper metadata
            
        Returns:
            Processed paper data with LLM-generated insights
        """
        try:
            logger.info(f"Starting workflow for paper: {paper_data.get('arxiv_id')}")
            
            # Initialize state
            initial_state = {
                'arxiv_id': paper_data.get('arxiv_id', ''),
                'title': paper_data.get('title', ''),
                'authors': paper_data.get('authors', []),
                'abstract': paper_data.get('abstract', ''),
                'category': paper_data.get('category', ''),
                'pdf_url': paper_data.get('pdf_url', ''),
                'arxiv_url': paper_data.get('arxiv_url', ''),
                'published_date': paper_data.get('published', ''),
                'summary': '',
                'why_it_matters': '',
                'applications': [],
                'processed': False,
                'processing_errors': [],
                'current_node': '',
                'created_at': datetime.now(),
                'processed_at': None
            }
            
            # Run workflow
            final_state = self.app.invoke(initial_state)
            
            # Convert to output format
            result = {
                **paper_data,
                'summary': final_state.get('summary', ''),
                'why_it_matters': final_state.get('why_it_matters', ''),
                'applications': final_state.get('applications', []),
                'processed': final_state.get('processed', False),
                'processed_at': final_state.get('processed_at'),
                'processing_errors': final_state.get('processing_errors', [])
            }
            
            logger.info(f"Workflow completed for paper: {paper_data.get('arxiv_id')}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing paper {paper_data.get('arxiv_id')}: {e}")
            return {
                **paper_data,
                'processed': False,
                'processing_errors': [f"Workflow error: {str(e)}"]
            }
    
    def process_papers_batch(self, papers: List[Dict]) -> List[Dict]:
        """
        Process multiple papers through the workflow
        
        Args:
            papers: List of paper dictionaries
            
        Returns:
            List of processed papers
        """
        processed_papers = []
        
        for i, paper in enumerate(papers):
            logger.info(f"Processing paper {i+1}/{len(papers)}: {paper.get('arxiv_id')}")
            try:
                processed_paper = self.process_paper(paper)
                processed_papers.append(processed_paper)
            except Exception as e:
                logger.error(f"Failed to process paper {paper.get('arxiv_id')}: {e}")
                processed_papers.append({
                    **paper,
                    'processed': False,
                    'processing_errors': [str(e)]
                })
        
        logger.info(f"Batch processing complete: {len(processed_papers)} papers processed")
        return processed_papers
