# LangGraph Workflow Architecture

## Overview
The paper processing pipeline uses LangGraph to orchestrate multiple LLM nodes for intelligent paper analysis and summarization.

## Architecture

### Workflow Structure
```
┌─────────────┐
│  Ingestion  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Summary   │
│ Generation  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Why It      │
│ Matters     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Applications │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Quality    │
│ Validation  │
└──────┬──────┘
       │
       ▼
     [END]
```

## Workflow Nodes

### 1. Ingestion Node
**Purpose**: Validate input data and prepare for processing

**Input**: Raw paper metadata
- arxiv_id
- title
- authors
- abstract
- category
- pdf_url
- arxiv_url
- published_date

**Output**: Validated state object

**Validation**:
- Checks for required fields
- Initializes processing state
- Sets timestamps

### 2. Summary Generation Node
**Purpose**: Generate plain English summary (3-5 lines)

**Input**: Paper title and abstract

**LLM Prompt**:
```
Create a clear, plain English summary of this paper.
- 3-5 lines maximum
- Simple, accessible language
- Focus on main contribution
- Avoid technical jargon
- Make it engaging
```

**Output**: `summary` field in state

### 3. Why It Matters Node
**Purpose**: Explain research significance and impact

**Input**: Paper title, abstract, and summary

**LLM Prompt**:
```
Explain why this research matters.
- 2-4 sentences
- Focus on real-world implications
- Be specific about who benefits
- Use clear, compelling language
```

**Output**: `why_it_matters` field in state

### 4. Applications Node
**Purpose**: Identify practical applications and use cases

**Input**: Paper title, abstract, and summary

**LLM Prompt**:
```
Identify practical applications for this research.
- List 3-5 specific applications
- Focus on real-world use cases
- Be concrete and specific
- Each application: 1-2 sentences
- Format as JSON array
```

**Output**: `applications` array in state

### 5. Quality Validation Node
**Purpose**: Validate generated content and finalize processing

**Validation Checks**:
- Summary exists and is sufficient length (>50 chars)
- Why it matters exists
- Applications list is not empty

**Output**: 
- Sets `processed` flag (true/false)
- Sets `processed_at` timestamp
- Collects any validation errors

## State Management

### PaperState TypedDict
```python
{
    # Paper metadata
    'arxiv_id': str,
    'title': str,
    'authors': List[str],
    'abstract': str,
    'category': str,
    'pdf_url': str,
    'arxiv_url': str,
    'published_date': str,
    
    # Processing fields
    'summary': str,
    'why_it_matters': str,
    'applications': List[str],
    
    # Workflow control
    'processed': bool,
    'processing_errors': List[str],
    'current_node': str,
    
    # Timestamps
    'created_at': datetime,
    'processed_at': datetime
}
```

## LLM Provider Configuration

### Supported Providers
1. **Google Gemini** (Primary)
   - Model: `gemini-2.0-flash-exp`
   - Temperature: 0.7
   - Max tokens: 2048

2. **Groq** (Fallback)
   - Model: `llama-3.3-70b-versatile`
   - Temperature: 0.7
   - Max tokens: 2048

### Configuration
Set environment variables:
```bash
GEMINI_API_KEY=your_gemini_key
# OR
GROQ_API_KEY=your_groq_key
```

## Error Handling

### Node-Level Errors
- Each node catches exceptions
- Errors appended to `processing_errors` list
- Workflow continues to next node
- Failed nodes don't block subsequent processing

### Validation Errors
- Collected in quality validation node
- Paper marked as `processed=False` if validation fails
- Errors stored for debugging

### Workflow-Level Errors
- Caught in `process_paper()` method
- Returns paper with error information
- Doesn't crash entire batch processing

## Usage

### Process Single Paper
```python
from paper_processing_workflow import PaperProcessingWorkflow

workflow = PaperProcessingWorkflow()

paper_data = {
    'arxiv_id': '2024.12345',
    'title': 'Example Paper',
    'authors': ['John Doe'],
    'abstract': 'This is an example abstract...',
    'category': 'cs.AI',
    'pdf_url': 'https://arxiv.org/pdf/2024.12345',
    'arxiv_url': 'https://arxiv.org/abs/2024.12345',
    'published': '2024-01-01'
}

result = workflow.process_paper(paper_data)

print(f"Summary: {result['summary']}")
print(f"Why it matters: {result['why_it_matters']}")
print(f"Applications: {result['applications']}")
```

### Process Batch
```python
papers = [paper1, paper2, paper3]
results = workflow.process_papers_batch(papers)

for result in results:
    if result['processed']:
        print(f"✅ {result['arxiv_id']}")
    else:
        print(f"❌ {result['arxiv_id']}: {result['processing_errors']}")
```

### Integrated Pipeline
```python
from integrated_scraper import IntegratedPaperPipeline

pipeline = IntegratedPaperPipeline()

# Run complete pipeline: fetch → deduplicate → process → store
stats = pipeline.run_pipeline(
    categories=['cs.AI', 'cs.ML'],
    max_papers_per_category=10
)

print(f"Processed: {stats['papers_processed']}")
print(f"Stored: {stats['papers_stored']}")
```

## Testing

### Run Tests
```bash
cd backend/scraper
python test_workflow.py
```

### Test Coverage
1. **Single Paper Processing**: Tests complete workflow with sample paper
2. **Error Handling**: Tests validation with invalid data
3. **Batch Processing**: Tests multiple papers (optional)

### Expected Output
```
✅ Workflow initialized successfully
✅ Paper processed: 2024.12345
📝 Summary: [Generated summary]
💡 Why It Matters: [Generated insights]
🎯 Applications: [List of applications]
```

## Performance Considerations

### Processing Time
- Single paper: ~5-15 seconds (depends on LLM provider)
- Batch of 10 papers: ~1-2 minutes
- Rate limits: Respect LLM provider limits

### Optimization Strategies
1. **Batch Processing**: Process multiple papers in sequence
2. **Async Processing**: Can be extended for parallel processing
3. **Caching**: Consider caching LLM responses for similar papers
4. **Retry Logic**: Built into LLM providers

## Monitoring

### Logging
All nodes log:
- Entry and exit
- Success/failure status
- Processing time
- Errors and warnings

### Metrics to Track
- Papers processed per hour
- Success rate
- Average processing time per paper
- Error rate by node
- LLM API costs

## Future Enhancements

### Potential Additions
1. **Conditional Routing**: Route papers based on category or complexity
2. **Human-in-the-Loop**: Add review node for quality control
3. **Parallel Processing**: Process multiple papers simultaneously
4. **Retry Logic**: Automatic retry for failed nodes
5. **A/B Testing**: Compare different prompts or models
6. **Feedback Loop**: Learn from user engagement to improve summaries

### Advanced Features
- **Multi-Agent Collaboration**: Multiple LLMs working together
- **Tool Integration**: Add web search, citation lookup, etc.
- **Streaming**: Stream results as they're generated
- **Checkpointing**: Save state for long-running workflows

## Troubleshooting

### Common Issues

**Issue**: "Either GEMINI_API_KEY or GROQ_API_KEY must be set"
- **Solution**: Set API key in environment or .env file

**Issue**: "Validation failed: Summary is too short"
- **Solution**: Check LLM response, may need to adjust prompt

**Issue**: "JSON parsing error in applications node"
- **Solution**: Fallback parser handles non-JSON responses

**Issue**: Slow processing
- **Solution**: Check LLM provider status, consider switching providers

## Dependencies

```
langgraph>=0.2.0
langchain>=0.3.0
langchain-google-genai>=2.0.0
langchain-groq>=0.2.0
langchain-core>=0.3.0
```

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://python.langchain.com/)
- [Gemini API](https://ai.google.dev/)
- [Groq API](https://groq.com/)
