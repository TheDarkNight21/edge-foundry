#!/usr/bin/env python3
"""
Telemetry module for Edge Foundry - tracks inference metrics and stores them in SQLite.
"""

import sqlite3
import time
import psutil
import os
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path

class TelemetryDB:
    """SQLite database for storing inference telemetry data."""
    
    def __init__(self, db_path: str = "telemetry.db"):
        """Initialize the telemetry database."""
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Create the telemetry table if it doesn't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS telemetry (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    prompt_length INTEGER NOT NULL,
                    latency_ms REAL NOT NULL,
                    tokens_generated INTEGER NOT NULL,
                    tokens_per_second REAL NOT NULL,
                    memory_mb REAL NOT NULL,
                    model_path TEXT,
                    temperature REAL,
                    max_tokens INTEGER
                )
            """)
            conn.commit()
    
    def record_inference(
        self,
        prompt_length: int,
        latency_ms: float,
        tokens_generated: int,
        memory_mb: float,
        model_path: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ):
        """Record a single inference in the database."""
        tokens_per_second = tokens_generated / (latency_ms / 1000.0) if latency_ms > 0 else 0
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO telemetry 
                (timestamp, prompt_length, latency_ms, tokens_generated, tokens_per_second, 
                 memory_mb, model_path, temperature, max_tokens)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.now().isoformat(),
                prompt_length,
                latency_ms,
                tokens_generated,
                tokens_per_second,
                memory_mb,
                model_path,
                temperature,
                max_tokens
            ))
            conn.commit()
    
    def get_metrics_summary(self, limit: int = 100) -> Dict[str, Any]:
        """Get a summary of recent telemetry data."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get recent records
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_inferences,
                    AVG(latency_ms) as avg_latency_ms,
                    AVG(tokens_per_second) as avg_tokens_per_second,
                    AVG(memory_mb) as avg_memory_mb,
                    MAX(timestamp) as last_inference,
                    MIN(timestamp) as first_inference
                FROM telemetry
            """)
            summary = cursor.fetchone()
            
            # Get recent records for detailed view
            cursor.execute("""
                SELECT 
                    timestamp,
                    prompt_length,
                    latency_ms,
                    tokens_generated,
                    tokens_per_second,
                    memory_mb,
                    model_path,
                    temperature,
                    max_tokens
                FROM telemetry 
                ORDER BY timestamp DESC 
                LIMIT ?
            """, (limit,))
            recent_records = cursor.fetchall()
            
            return {
                "summary": {
                    "total_inferences": summary[0] or 0,
                    "avg_latency_ms": round(summary[1] or 0, 2),
                    "avg_tokens_per_second": round(summary[2] or 0, 2),
                    "avg_memory_mb": round(summary[3] or 0, 2),
                    "last_inference": summary[4],
                    "first_inference": summary[5]
                },
                "recent_records": recent_records
            }
    
    def get_all_records(self) -> list:
        """Get all telemetry records."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    id,
                    timestamp,
                    prompt_length,
                    latency_ms,
                    tokens_generated,
                    tokens_per_second,
                    memory_mb,
                    model_path,
                    temperature,
                    max_tokens
                FROM telemetry 
                ORDER BY timestamp DESC
            """)
            return cursor.fetchall()

def get_memory_usage() -> float:
    """Get current memory usage in MB."""
    process = psutil.Process()
    memory_info = process.memory_info()
    return memory_info.rss / 1024 / 1024  # Convert to MB

def count_tokens(text: str) -> int:
    """Simple token counter - approximates token count by splitting on whitespace."""
    # This is a rough approximation. For more accurate counting, 
    # you'd want to use the actual tokenizer from the model
    return len(text.split())

# Global telemetry instance
telemetry_db = TelemetryDB()
