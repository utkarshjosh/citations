"""
Test script for LangGraph Paper Processing Workflow
"""
import logging
import json
from datetime import datetime
from paper_processing_workflow import PaperProcessingWorkflow

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_single_paper():
    """Test workflow with a single sample paper"""
    
    # Sample paper data
    sample_paper = {
        'arxiv_id': '2024.12345',
        'title': 'Attention Is All You Need: A Comprehensive Study',
        'authors': ['John Doe', 'Jane Smith'],
        'abstract': '''
        We propose a new simple network architecture, the Transformer, based solely on 
        attention mechanisms, dispensing with recurrence and convolutions entirely. 
        Experiments on two machine translation tasks show these models to be superior 
        in quality while being more parallelizable and requiring significantly less time 
        to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German 
        translation task, improving over the existing best results, including ensembles, 
        by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model 
        establishes a new single-model state-of-the-art BLEU score of 41.8 after 
        training for 3.5 days on eight GPUs.
        ''',
        'category': 'cs.AI',
        'pdf_url': 'https://arxiv.org/pdf/2024.12345',
        'arxiv_url': 'https://arxiv.org/abs/2024.12345',
        'published': '2024-01-01'
    }
    
    logger.info("=" * 80)
    logger.info("Testing LangGraph Paper Processing Workflow")
    logger.info("=" * 80)
    
    try:
        # Initialize workflow
        logger.info("\n1. Initializing workflow...")
        workflow = PaperProcessingWorkflow()
        logger.info("✅ Workflow initialized successfully")
        
        # Process paper
        logger.info(f"\n2. Processing paper: {sample_paper['arxiv_id']}")
        result = workflow.process_paper(sample_paper)
        
        # Display results
        logger.info("\n" + "=" * 80)
        logger.info("PROCESSING RESULTS")
        logger.info("=" * 80)
        
        logger.info(f"\n📄 Paper: {result['title']}")
        logger.info(f"🆔 arXiv ID: {result['arxiv_id']}")
        logger.info(f"👥 Authors: {', '.join(result['authors'])}")
        logger.info(f"🏷️  Category: {result['category']}")
        
        logger.info(f"\n✅ Processed: {result['processed']}")
        
        if result.get('processing_errors'):
            logger.warning(f"\n⚠️  Errors: {result['processing_errors']}")
        
        logger.info(f"\n📝 Summary:\n{result.get('summary', 'N/A')}")
        logger.info(f"\n💡 Why It Matters:\n{result.get('why_it_matters', 'N/A')}")
        
        logger.info(f"\n🎯 Applications:")
        applications = result.get('applications', [])
        if applications:
            for i, app in enumerate(applications, 1):
                logger.info(f"   {i}. {app}")
        else:
            logger.info("   N/A")
        
        logger.info("\n" + "=" * 80)
        
        # Save results to file
        output_file = f"test_workflow_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        logger.info(f"\n💾 Results saved to: {output_file}")
        
        return result
        
    except Exception as e:
        logger.error(f"\n❌ Test failed: {e}", exc_info=True)
        return None


def test_batch_papers():
    """Test workflow with multiple papers"""
    
    sample_papers = [
        {
            'arxiv_id': '2024.001',
            'title': 'Deep Learning for Computer Vision',
            'authors': ['Alice Johnson'],
            'abstract': 'This paper presents a novel approach to computer vision using deep learning techniques.',
            'category': 'cs.CV',
            'pdf_url': 'https://arxiv.org/pdf/2024.001',
            'arxiv_url': 'https://arxiv.org/abs/2024.001',
            'published': '2024-01-01'
        },
        {
            'arxiv_id': '2024.002',
            'title': 'Natural Language Processing with Transformers',
            'authors': ['Bob Smith'],
            'abstract': 'We explore the use of transformer models for various NLP tasks.',
            'category': 'cs.CL',
            'pdf_url': 'https://arxiv.org/pdf/2024.002',
            'arxiv_url': 'https://arxiv.org/abs/2024.002',
            'published': '2024-01-02'
        }
    ]
    
    logger.info("=" * 80)
    logger.info("Testing Batch Processing")
    logger.info("=" * 80)
    
    try:
        workflow = PaperProcessingWorkflow()
        results = workflow.process_papers_batch(sample_papers)
        
        logger.info(f"\n✅ Processed {len(results)} papers")
        
        successful = sum(1 for r in results if r.get('processed'))
        logger.info(f"✅ Successful: {successful}/{len(results)}")
        
        return results
        
    except Exception as e:
        logger.error(f"\n❌ Batch test failed: {e}", exc_info=True)
        return None


def test_error_handling():
    """Test workflow error handling with invalid data"""
    
    invalid_paper = {
        'arxiv_id': '2024.999',
        # Missing required fields
        'category': 'cs.AI'
    }
    
    logger.info("=" * 80)
    logger.info("Testing Error Handling")
    logger.info("=" * 80)
    
    try:
        workflow = PaperProcessingWorkflow()
        result = workflow.process_paper(invalid_paper)
        
        logger.info(f"\n✅ Error handling test completed")
        logger.info(f"Processed: {result.get('processed')}")
        logger.info(f"Errors: {result.get('processing_errors')}")
        
        return result
        
    except Exception as e:
        logger.error(f"\n❌ Error handling test failed: {e}", exc_info=True)
        return None


if __name__ == "__main__":
    logger.info("\n🧪 Starting LangGraph Workflow Tests\n")
    
    # Test 1: Single paper
    logger.info("\n" + "=" * 80)
    logger.info("TEST 1: Single Paper Processing")
    logger.info("=" * 80)
    result1 = test_single_paper()
    
    # Test 2: Error handling
    logger.info("\n" + "=" * 80)
    logger.info("TEST 2: Error Handling")
    logger.info("=" * 80)
    result2 = test_error_handling()
    
    # Test 3: Batch processing (optional - can be slow)
    # Uncomment to test batch processing
    # logger.info("\n" + "=" * 80)
    # logger.info("TEST 3: Batch Processing")
    # logger.info("=" * 80)
    # result3 = test_batch_papers()
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ All tests completed!")
    logger.info("=" * 80)
