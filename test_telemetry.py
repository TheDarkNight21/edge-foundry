#!/usr/bin/env python3
"""
Test script for Edge Foundry telemetry system.
This script can be used to test the telemetry functionality without requiring the full model setup.
"""

import time
import random
import sqlite3
from datetime import datetime
from telemetry import TelemetryDB, get_memory_usage, count_tokens

def generate_test_data(db: TelemetryDB, num_records: int = 10):
    """Generate test telemetry data for demonstration purposes."""
    print(f"Generating {num_records} test telemetry records...")
    
    for i in range(num_records):
        # Simulate realistic inference data
        prompt_length = random.randint(10, 100)
        latency_ms = random.uniform(50, 2000)  # 50ms to 2 seconds
        tokens_generated = random.randint(5, 50)
        memory_mb = random.uniform(10, 100)
        temperature = random.uniform(0.1, 1.0)
        max_tokens = random.choice([32, 64, 128, 256])
        
        db.record_inference(
            prompt_length=prompt_length,
            latency_ms=latency_ms,
            tokens_generated=tokens_generated,
            memory_mb=memory_mb,
            model_path="./models/tinyllama.gguf",
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        print(f"  Record {i+1}: {latency_ms:.1f}ms, {tokens_generated} tokens, {memory_mb:.1f}MB")
        time.sleep(0.1)  # Small delay to simulate real usage
    
    print("✅ Test data generated successfully!")

def test_telemetry_db():
    """Test the telemetry database functionality."""
    print("🧪 Testing Edge Foundry Telemetry System")
    print("=" * 50)
    
    # Initialize database
    db = TelemetryDB("test_telemetry.db")
    print("✅ Database initialized")
    
    # Generate test data
    generate_test_data(db, 15)
    
    # Test metrics summary
    print("\n📊 Testing metrics summary...")
    metrics = db.get_metrics_summary(10)
    summary = metrics["summary"]
    
    print(f"Total inferences: {summary['total_inferences']}")
    print(f"Average latency: {summary['avg_latency_ms']:.2f} ms")
    print(f"Average tokens/sec: {summary['avg_tokens_per_second']:.2f}")
    print(f"Average memory: {summary['avg_memory_mb']:.2f} MB")
    
    # Test individual record retrieval
    print("\n📋 Testing record retrieval...")
    all_records = db.get_all_records()
    print(f"Retrieved {len(all_records)} total records")
    
    if all_records:
        latest = all_records[0]
        print(f"Latest record: {latest[1]} - {latest[3]:.1f}ms - {latest[4]} tokens")
    
    print("\n✅ All telemetry tests passed!")
    return db

def simulate_api_calls():
    """Simulate API calls to test the full system."""
    print("\n🌐 Simulating API calls...")
    print("Note: This requires the agent to be running on localhost:8000")
    
    try:
        import requests
        
        # Test health endpoint
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Agent is running and healthy")
            
            # Test inference endpoint
            test_prompts = [
                "Hello, how are you?",
                "What is the capital of France?",
                "Explain quantum computing in simple terms.",
                "Write a short poem about AI.",
                "What are the benefits of renewable energy?"
            ]
            
            for i, prompt in enumerate(test_prompts):
                print(f"  Sending request {i+1}: {prompt[:30]}...")
                
                response = requests.post("http://localhost:8000/inference", json={
                    "prompt": prompt,
                    "max_tokens": 64,
                    "temperature": 0.7
                })
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"    ✅ Response: {result['response'][:50]}...")
                else:
                    print(f"    ❌ Error: {response.status_code}")
                
                time.sleep(1)  # Wait between requests
            
            print("✅ API simulation completed!")
            
        else:
            print(f"❌ Agent health check failed: {response.status_code}")
            
    except ImportError:
        print("❌ requests library not available. Install with: pip install requests")
    except Exception as e:
        print(f"❌ API simulation failed: {e}")

if __name__ == "__main__":
    print("Edge Foundry Telemetry Test Suite")
    print("=" * 40)
    
    # Test 1: Database functionality
    db = test_telemetry_db()
    
    # Test 2: Memory usage function
    print(f"\n💾 Current memory usage: {get_memory_usage():.2f} MB")
    
    # Test 3: Token counting
    test_text = "This is a test prompt for token counting functionality."
    token_count = count_tokens(test_text)
    print(f"🔤 Token count for '{test_text}': {token_count}")
    
    # Test 4: API simulation (optional)
    print("\n" + "=" * 50)
    simulate_api_calls()
    
    print("\n🎉 All tests completed!")
    print("\nTo view the test data, run:")
    print("  python -c \"from telemetry import TelemetryDB; db = TelemetryDB('test_telemetry.db'); print(db.get_metrics_summary())\"")
    print("\nOr use the CLI:")
    print("  python cli.py metrics --limit 10")
