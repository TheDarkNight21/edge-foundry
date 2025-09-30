#!/usr/bin/env python3
"""
Test script for Edge Foundry CLI
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def run_command(cmd):
    """Run a command and return the result."""
    print(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
        print(f"Exit code: {result.returncode}")
        if result.stdout:
            print(f"STDOUT:\n{result.stdout}")
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def main():
    """Test the CLI commands."""
    print("🧪 Testing Edge Foundry CLI")
    print("=" * 50)
    
    # Test init
    print("\n1. Testing 'edgefoundry init'")
    success = run_command([sys.executable, "cli.py", "init"])
    if not success:
        print("❌ Init failed")
        return
    
    # Test status (should show not running)
    print("\n2. Testing 'edgefoundry status' (should show not running)")
    run_command([sys.executable, "cli.py", "status"])
    
    # Test deploy (using the existing model from load_model.py)
    print("\n3. Testing 'edgefoundry deploy'")
    # First, let's create a dummy model file for testing
    dummy_model = Path("dummy_model.gguf")
    dummy_model.write_text("dummy model content")
    
    success = run_command([sys.executable, "cli.py", "deploy", str(dummy_model)])
    if not success:
        print("❌ Deploy failed")
        return
    
    # Test status again
    print("\n4. Testing 'edgefoundry status' (after deploy)")
    run_command([sys.executable, "cli.py", "status"])
    
    # Test start (this might fail if no real model, but we can test the command)
    print("\n5. Testing 'edgefoundry start'")
    run_command([sys.executable, "cli.py", "start"])
    
    # Wait a moment
    time.sleep(2)
    
    # Test status
    print("\n6. Testing 'edgefoundry status' (after start)")
    run_command([sys.executable, "cli.py", "status"])
    
    # Test logs
    print("\n7. Testing 'edgefoundry logs'")
    run_command([sys.executable, "cli.py", "logs"])
    
    # Test stop
    print("\n8. Testing 'edgefoundry stop'")
    run_command([sys.executable, "cli.py", "stop"])
    
    # Final status
    print("\n9. Final 'edgefoundry status'")
    run_command([sys.executable, "cli.py", "status"])
    
    # Cleanup
    print("\n🧹 Cleaning up...")
    if dummy_model.exists():
        dummy_model.unlink()
    
    print("\n✅ CLI testing completed!")

if __name__ == "__main__":
    main()
