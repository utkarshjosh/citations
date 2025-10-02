# Database Setup and Schema Documentation

## Overview
Brain Scroll uses MongoDB as its primary database for storing research papers, user data, and engagement metrics.

## Collections

### 1. Papers Collection
Stores research papers from arXiv with processed summaries and metadata.

**Schema:**
```javascript
{
  arxiv_id: String (required, unique),
  title: String (required),
  authors: Array<String> (required),
  abstract: String (required),
  summary: String (nullable),
  why_it_matters: String (nullable),
  applications: Array<String>,
  category: String (required),
  pdf_url: String (nullable),
  arxiv_url: String (nullable),
  published_date: Date (nullable),
  likes_count: Number (default: 0),
  views_count: Number (default: 0),
  processed: Boolean (default: false),
  processed_at: Date (nullable),
  created_at: Date (required),
  updated_at: Date (required)
}
```

**Indexes:**
- `arxiv_id` (unique)
- `created_at` (descending)
- `category`
- `processed`
- `processed_at`
- `likes_count` (descending)
- `published_date` (descending)
- `category + created_at` (compound)
- `category + likes_count` (compound)

### 2. Users Collection
Stores user accounts and preferences.

**Schema:**
```javascript
{
  email: String (required, unique),
  name: String (nullable),
  preferences: {
    categories: Array<String>,
    email_notifications: Boolean (default: true),
    notification_frequency: String (enum: ['daily', 'weekly', 'never'])
  },
  subscription_status: String (enum: ['active', 'unsubscribed', 'bounced']),
  last_active: Date,
  created_at: Date (required),
  updated_at: Date (required)
}
```

**Indexes:**
- `email` (unique)
- `created_at` (descending)
- `subscription_status`
- `last_active` (descending)
- `preferences.categories`

### 3. Engagement Collection
Tracks user interactions with papers (likes, views, shares, bookmarks).

**Schema:**
```javascript
{
  paper_id: String (required),
  user_id: String (nullable),
  session_id: String (nullable),
  engagement_type: String (required, enum: ['like', 'view', 'share', 'bookmark']),
  metadata: {
    ip_address: String (nullable),
    user_agent: String (nullable),
    referrer: String (nullable),
    device_type: String (nullable, enum: ['mobile', 'tablet', 'desktop'])
  },
  created_at: Date (required)
}
```

**Indexes:**
- `paper_id + user_id + engagement_type` (compound)
- `paper_id + created_at` (compound, descending)
- `user_id + created_at` (compound, descending)
- `session_id`
- `engagement_type`
- `created_at` (descending)
- `paper_id + engagement_type + created_at` (compound for analytics)

## Setup Instructions

### 1. Install MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Or use MongoDB Atlas (cloud)
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update:
```bash
MONGODB_URI=mongodb://localhost:27017/brain_scroll
MONGODB_DB_NAME=brain_scroll
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Test Database Connection
```bash
npm run test:db
```

### 5. Start the API Server
```bash
npm run dev
```

## Database Connection

The database connection is managed by the `Database` class in `src/utils/db.js`:

- **Singleton Pattern**: Ensures only one connection instance
- **Connection Pooling**: Configured with min/max pool sizes
- **Automatic Reconnection**: Handles connection failures gracefully
- **Schema Validation**: Enforces data integrity at the database level
- **Index Management**: Automatically creates indexes on startup

## Usage Examples

### Inserting a Paper
```javascript
import database from './utils/db.js';
import { Paper } from './models/index.js';

const paperData = Paper.sanitize({
  arxiv_id: '2024.12345',
  title: 'Example Paper',
  authors: ['John Doe'],
  abstract: 'This is an example abstract.',
  category: 'cs.AI'
});

const collection = database.getPapersCollection();
await collection.insertOne(paperData);
```

### Querying Papers
```javascript
// Get recent papers
const papers = await database.getPapersCollection()
  .find({ processed: true })
  .sort({ created_at: -1 })
  .limit(20)
  .toArray();

// Get papers by category
const aiPapers = await database.getPapersCollection()
  .find({ category: 'cs.AI' })
  .toArray();
```

### Recording Engagement
```javascript
import { Engagement } from './models/index.js';

const engagementData = Engagement.sanitize({
  paper_id: '2024.12345',
  user_id: 'user123',
  engagement_type: 'like'
});

await database.getEngagementCollection().insertOne(engagementData);
```

### Getting Trending Papers
```javascript
import { Engagement } from './models/index.js';

const trending = await Engagement.getTrending(
  database.getEngagementCollection(),
  10,  // limit
  7    // days back
);
```

## Performance Considerations

1. **Indexes**: All frequently queried fields have indexes
2. **Connection Pooling**: Configured for optimal performance
3. **Compound Indexes**: Used for common query patterns
4. **Schema Validation**: Enforced at database level for data integrity

## Maintenance

### Backup
```bash
mongodump --db brain_scroll --out /backup/path
```

### Restore
```bash
mongorestore --db brain_scroll /backup/path/brain_scroll
```

### Monitor Performance
```javascript
const stats = await database.getStats();
console.log(stats);
```

## Health Check

The API provides a health check endpoint that includes database status:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": {
    "connected": true,
    "stats": {
      "database": "brain_scroll",
      "collections": 3,
      "dataSize": 1234567,
      "indexSize": 234567,
      "counts": {
        "papers": 100,
        "users": 50,
        "engagement": 500
      }
    }
  }
}
```
