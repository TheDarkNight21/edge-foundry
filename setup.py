#!/usr/bin/env python3
"""
Edge Foundry Setup Script
Handles complete setup including model download and initialization.
"""

import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def main():
    """Main setup function."""
    print("🚀 Edge Foundry Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("cli.py").exists():
        print("❌ Please run this script from the Edge Foundry root directory")
        sys.exit(1)
    
    # Step 1: Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Step 2: Download model
    if not run_command("python cli.py download", "Downloading model"):
        print("❌ Failed to download model")
        sys.exit(1)
    
    # Step 3: Initialize Edge Foundry
    if not run_command("python cli.py init", "Initializing Edge Foundry"):
        print("❌ Failed to initialize Edge Foundry")
        sys.exit(1)
    
    # Step 4: Deploy model
    if not run_command("python cli.py deploy --model models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf", "Deploying model"):
        print("❌ Failed to deploy model")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup Complete!")
    print("=" * 50)
    print("✅ Dependencies installed")
    print("✅ Model downloaded")
    print("✅ Edge Foundry initialized")
    print("✅ Model deployed")
    print("\n🚀 Ready to start the agent!")
    print("Run: python cli.py start")
    print("Then test: python cli.py status")

if __name__ == "__main__":
    main()