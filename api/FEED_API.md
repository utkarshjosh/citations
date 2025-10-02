# Feed API Documentation

## Overview
The Feed API provides endpoints for retrieving paginated research papers with filtering and sorting capabilities.

## Base URL
```
http://localhost:3000/api/feed
```

## Endpoints

### 1. GET /api/feed
Get paginated feed of research papers.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) for page-based pagination |
| `limit` | integer | 20 | Items per page (max: 100) |
| `category` | string | null | Filter by arXiv category (e.g., 'cs.AI', 'cs.ML') |
| `cursor` | string | null | Base64-encoded cursor for cursor-based pagination |
| `sort` | string | 'newest' | Sort order: 'newest', 'popular', or 'trending' |

#### Response Format

**Page-based pagination:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "arxiv_id": "2024.12345",
      "title": "Attention Is All You Need",
      "authors": ["John Doe", "Jane Smith"],
      "summary": "Plain English summary...",
      "why_it_matters": "Why this research matters...",
      "applications": ["Application 1", "Application 2"],
      "category": "cs.AI",
      "pdf_url": "https://arxiv.org/pdf/2024.12345",
      "arxiv_url": "https://arxiv.org/abs/2024.12345",
      "published_date": "2024-01-01T00:00:00.000Z",
      "likes_count": 42,
      "views_count": 1337,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  },
  "filters": {
    "category": null,
    "sort": "newest"
  }
}
```

**Cursor-based pagination:**
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "hasMore": true,
    "nextCursor": "eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0wMVQwMDowMDowMC4wMDBaIiwibGlrZXNfY291bnQiOjQyLCJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSJ9"
  },
  "filters": {
    "category": null,
    "sort": "newest"
  }
}
```

#### Examples

**Basic request:**
```bash
curl "http://localhost:3000/api/feed"
```

**With pagination:**
```bash
curl "http://localhost:3000/api/feed?page=2&limit=10"
```

**Filter by category:**
```bash
curl "http://localhost:3000/api/feed?category=cs.AI"
```

**Sort by popularity:**
```bash
curl "http://localhost:3000/api/feed?sort=popular&limit=20"
```

**Cursor-based pagination:**
```bash
# First request
curl "http://localhost:3000/api/feed?limit=20"

# Use nextCursor from response for next page
curl "http://localhost:3000/api/feed?cursor=eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0wMVQwMDowMDowMC4wMDBaIn0&limit=20"
```

#### Sort Options

- **newest** (default): Sort by `created_at` descending (most recent first)
- **popular**: Sort by `likes_count` descending, then `created_at` descending
- **trending**: Sort by combination of `likes_count`, `views_count`, and `created_at` descending

#### Error Responses

**400 Bad Request - Invalid cursor:**
```json
{
  "error": "Invalid cursor",
  "message": "The provided cursor is malformed or expired"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
```

---

### 2. GET /api/feed/categories
Get list of available categories with paper counts.

#### Response Format
```json
{
  "data": [
    {
      "category": "cs.AI",
      "count": 50
    },
    {
      "category": "cs.ML",
      "count": 30
    },
    {
      "category": "cs.CV",
      "count": 20
    }
  ],
  "total": 3
}
```

#### Example
```bash
curl "http://localhost:3000/api/feed/categories"
```

---

### 3. GET /api/feed/stats
Get overall feed statistics.

#### Response Format
```json
{
  "data": {
    "totalPapers": 100,
    "totalLikes": 500,
    "totalViews": 5000,
    "avgLikes": 5.0,
    "avgViews": 50.0
  }
}
```

#### Example
```bash
curl "http://localhost:3000/api/feed/stats"
```

---

## Pagination Strategies

### Page-Based Pagination
Best for:
- Traditional pagination UI with page numbers
- Jumping to specific pages
- Showing total page count

**Pros:**
- Simple to implement in UI
- Users can jump to any page
- Shows total count

**Cons:**
- Performance degrades with large offsets
- Data can shift between pages if new items are added

### Cursor-Based Pagination
Best for:
- Infinite scroll UI
- Real-time feeds
- Large datasets

**Pros:**
- Consistent performance regardless of position
- No duplicate or missing items when data changes
- Efficient for infinite scroll

**Cons:**
- Cannot jump to specific pages
- No total count available
- Cursor becomes invalid if item is deleted

---

## Performance Considerations

### Database Indexes
The following indexes are automatically created to optimize feed queries:

- `created_at` (descending) - for newest sort
- `likes_count` (descending) - for popular sort
- `category` - for category filtering
- `category + created_at` (compound) - for filtered newest
- `category + likes_count` (compound) - for filtered popular

### Rate Limiting
The API applies rate limiting to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

### Caching Recommendations
For production deployments, consider:
- Redis caching for frequently accessed pages
- CDN caching for static responses
- Cache invalidation on new paper additions

---

## Integration Examples

### React with Infinite Scroll
```javascript
import { useState, useEffect } from 'react';

function FeedComponent() {
  const [papers, setPapers] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const url = cursor 
      ? `http://localhost:3000/api/feed?cursor=${cursor}&limit=20`
      : 'http://localhost:3000/api/feed?limit=20';
    
    const response = await fetch(url);
    const data = await response.json();
    
    setPapers([...papers, ...data.data]);
    setCursor(data.pagination.nextCursor);
    setLoading(false);
  };

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div>
      {papers.map(paper => (
        <PaperCard key={paper._id} paper={paper} />
      ))}
      {cursor && (
        <button onClick={loadMore} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
}
```

### React with Page-Based Pagination
```javascript
import { useState, useEffect } from 'react';

function FeedComponent() {
  const [papers, setPapers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchPapers = async () => {
      const response = await fetch(
        `http://localhost:3000/api/feed?page=${page}&limit=20`
      );
      const data = await response.json();
      
      setPapers(data.data);
      setTotalPages(data.pagination.totalPages);
    };

    fetchPapers();
  }, [page]);

  return (
    <div>
      {papers.map(paper => (
        <PaperCard key={paper._id} paper={paper} />
      ))}
      <Pagination 
        current={page}
        total={totalPages}
        onChange={setPage}
      />
    </div>
  );
}
```

---

## Testing

### Run Unit Tests
```bash
npm test
```

### Run Manual Tests
```bash
# Make script executable
chmod +x test-feed-endpoint.sh

# Run tests
./test-feed-endpoint.sh
```

### Test Coverage
The test suite covers:
- Default pagination behavior
- Custom page and limit parameters
- Category filtering
- Sort options (newest, popular, trending)
- Cursor-based pagination
- Invalid cursor handling
- Limit enforcement (max 100)
- Error handling
- Categories endpoint
- Stats endpoint

---

## Environment Variables

```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/brain_scroll
MONGODB_DB_NAME=brain_scroll

# Server configuration
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=combined
```

---

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Filtering**
   - Date range filtering
   - Author search
   - Full-text search in titles/abstracts
   - Multiple category selection

2. **Personalization**
   - User-specific feeds based on preferences
   - Recommendation engine
   - Bookmarked papers feed

3. **Analytics**
   - Trending papers calculation with time decay
   - Popular authors
   - Category trends over time

4. **Performance**
   - Redis caching layer
   - GraphQL support for flexible queries
   - Elasticsearch integration for full-text search

5. **Real-time Updates**
   - WebSocket support for live feed updates
   - Push notifications for new papers
