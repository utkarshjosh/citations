"""
MongoDB connection handler with connection pooling and error handling
"""
import logging
from typing import Optional
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from tenacity import retry, stop_after_attempt, wait_exponential

from config import MONGODB_URI, MONGODB_DB_NAME

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Manages MongoDB connection with retry logic and connection pooling"""
    
    _instance: Optional['DatabaseConnection'] = None
    _client: Optional[MongoClient] = None
    
    def __new__(cls):
        """Singleton pattern to ensure single database connection"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def connect(self) -> MongoClient:
        """
        Establish connection to MongoDB with retry logic
        
        Returns:
            MongoClient: Connected MongoDB client
            
        Raises:
            ConnectionFailure: If unable to connect after retries
        """
        if self._client is None:
            try:
                logger.info(f"Connecting to MongoDB at {MONGODB_URI}")
                self._client = MongoClient(
                    MONGODB_URI,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=10000,
                    maxPoolSize=50,
                    minPoolSize=10
                )
                # Test connection
                self._client.admin.command('ping')
                logger.info("Successfully connected to MongoDB")
                
                # Initialize indexes
                self._initialize_indexes()
                
            except (ConnectionFailure, ServerSelectionTimeoutError) as e:
                logger.error(f"Failed to connect to MongoDB: {e}")
                self._client = None
                raise
        
        return self._client
    
    def _initialize_indexes(self):
        """Create indexes for optimal query performance"""
        try:
            db = self._client[MONGODB_DB_NAME]
            papers_collection = db.papers
            
            # Create indexes
            papers_collection.create_index([("arxiv_id", ASCENDING)], unique=True)
            papers_collection.create_index([("created_at", DESCENDING)])
            papers_collection.create_index([("category", ASCENDING)])
            papers_collection.create_index([("processed_at", ASCENDING)])
            papers_collection.create_index([("likes_count", DESCENDING)])
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            raise
    
    def get_database(self):
        """
        Get database instance
        
        Returns:
            Database: MongoDB database instance
        """
        if self._client is None:
            self.connect()
        return self._client[MONGODB_DB_NAME]
    
    def get_collection(self, collection_name: str):
        """
        Get collection instance
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            Collection: MongoDB collection instance
        """
        db = self.get_database()
        return db[collection_name]
    
    def close(self):
        """Close MongoDB connection"""
        if self._client is not None:
            self._client.close()
            self._client = None
            logger.info("MongoDB connection closed")
    
    def health_check(self) -> bool:
        """
        Check if database connection is healthy
        
        Returns:
            bool: True if connection is healthy, False otherwise
        """
        try:
            if self._client is None:
                return False
            self._client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False


# Global database connection instance
db_connection = DatabaseConnection()


def get_papers_collection():
    """
    Convenience function to get papers collection
    
    Returns:
        Collection: Papers collection instance
    """
    return db_connection.get_collection("papers")
