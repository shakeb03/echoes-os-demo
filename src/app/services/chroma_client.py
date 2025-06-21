# 📁 /app/services/chroma_client.py
import chromadb
from chromadb import PersistentClient
from openai import OpenAI
import os
from typing import List, Dict, Any, Optional
import logging
import uuid
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()


from app.utils.chunker import chunk_text

# Initialize OpenAI for embeddings
# openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize ChromaDB client

chroma_client = PersistentClient(path="./chroma_db")

# Get or create collection
collection = chroma_client.get_or_create_collection(
    name="echoes_memories",
    metadata={"description": "Echoes OS memory storage"}
)

async def embed_content(
    content: str,
    title: str,
    source: str,
    content_type: str,
    content_id: str,
    timestamp: str
) -> Dict[str, Any]:
    """
    Embed content into ChromaDB with metadata
    """
    try:
        # Chunk the content
        chunks = chunk_text(content, max_tokens=800)
        
        # Generate embeddings for each chunk
        embeddings = []
        documents = []
        metadatas = []
        ids = []
        
        for i, chunk in enumerate(chunks):
            # Get embedding from OpenAI
            response = client.embeddings.create(
                input=chunk,
                model="text-embedding-ada-002"
            )
            embedding = response.data[0].embedding
            
            chunk_id = f"{content_id}_chunk_{i}"
            
            embeddings.append(embedding)
            documents.append(chunk)
            metadatas.append({
                "title": title,
                "source": source,
                "content_type": content_type,
                "content_id": content_id,
                "chunk_index": i,
                "timestamp": timestamp,
                "chunk_length": len(chunk)
            })
            ids.append(chunk_id)
        
        # Add to ChromaDB
        collection.add(
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        return {
            "success": True,
            "content_id": content_id,
            "chunks_created": len(chunks),
            "total_tokens": sum(len(chunk.split()) for chunk in chunks)
        }
        
    except Exception as e:
        logging.error(f"Embedding failed: {e}")
        raise Exception(f"Failed to embed content: {str(e)}")

async def search_memories(
    query: str,
    limit: int = 5,
    threshold: float = 0.3
) -> List[Dict[str, Any]]:
    """
    Search memories using vector similarity
    """
    try:
        # Generate query embedding
        response = client.embeddings.create(
            input=query,
            model="text-embedding-ada-002"
        )
        query_embedding = response.data[0].embedding
        
        # Search ChromaDB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit * 2,  # Get more results to filter
            include=["documents", "metadatas", "distances"]
        )
        
        # Format and filter results
        formatted_results = []
        seen_content_ids = set()
        
        for i, (doc, metadata, distance) in enumerate(
            zip(results['documents'][0], results['metadatas'][0], results['distances'][0])
        ):
            # Convert distance to similarity score
            similarity_score = 1 - distance
            
            # Filter by threshold
            if similarity_score < threshold:
                continue
            
            # Avoid duplicate content (same content_id)
            content_id = metadata.get('content_id', '')
            if content_id in seen_content_ids:
                continue
            seen_content_ids.add(content_id)
            
            formatted_results.append({
                "id": f"mem_{i}_{content_id}",
                "content": doc,
                "source": metadata.get('source', ''),
                "title": metadata.get('title', ''),
                "timestamp": metadata.get('timestamp'),
                "score": round(similarity_score, 3),
                "content_type": metadata.get('content_type', ''),
                "chunk_index": metadata.get('chunk_index', 0)
            })
            
            if len(formatted_results) >= limit:
                break
        
        return formatted_results
        
    except Exception as e:
        logging.error(f"Memory search failed: {e}")
        return []

async def get_memory_by_id(memory_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific memory by ID
    """
    try:
        result = collection.get(
            ids=[memory_id],
            include=["documents", "metadatas"]
        )
        
        if result['ids'] and len(result['ids']) > 0:
            return {
                "id": result['ids'][0],
                "content": result['documents'][0],
                "metadata": result['metadatas'][0]
            }
        
        return None
        
    except Exception as e:
        logging.error(f"Failed to get memory {memory_id}: {e}")
        return None

async def delete_memory(content_id: str) -> bool:
    """
    Delete all chunks for a specific content ID
    """
    try:
        # Get all chunks for this content
        results = collection.get(
            where={"content_id": content_id},
            include=["documents", "metadatas"]
        )
        
        if results['ids']:
            collection.delete(ids=results['ids'])
            return True
        
        return False
        
    except Exception as e:
        logging.error(f"Failed to delete memory {content_id}: {e}")
        return False

async def get_collection_stats() -> Dict[str, Any]:
    """
    Get statistics about the ChromaDB collection
    """
    try:
        # Get total count
        result = collection.count()
        
        # Get sample of metadata to analyze
        sample = collection.get(
            limit=100,
            include=["metadatas"]
        )
        
        content_types = {}
        sources = {}
        
        for metadata in sample['metadatas']:
            content_type = metadata.get('content_type', 'unknown')
            source = metadata.get('source', 'unknown')
            
            content_types[content_type] = content_types.get(content_type, 0) + 1
            sources[source] = sources.get(source, 0) + 1
        
        return {
            "total_chunks": result,
            "content_types": content_types,
            "top_sources": dict(sorted(sources.items(), key=lambda x: x[1], reverse=True)[:10]),
            "collection_name": collection.name
        }
        
    except Exception as e:
        logging.error(f"Failed to get collection stats: {e}")
        return {"error": str(e)}

# Placeholder for private repo advanced features
def hybrid_search(query: str, options: dict = None):
    """
    Placeholder for hybrid search (vector + keyword)
    From private repo: advanced reranking, memory prioritization
    """
    pass

def memory_clustering(memories: List[Dict], options: dict = None):
    """
    Placeholder for memory clustering and organization
    From private repo: topic clustering, temporal grouping
    """
    pass