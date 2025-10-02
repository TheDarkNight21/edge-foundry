#!/usr/bin/env python3
"""
Test script to verify model download functionality.
"""

import sys
from pathlib import Path

def test_download():
    """Test the download functionality."""
    print("🧪 Testing model download functionality...")
    
    try:
        from huggingface_hub import hf_hub_download
        import shutil
        
        # Test parameters
        repo_id = "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF"
        filename = "tinyllama-1.1b-chat-v1.0.Q8_0.gguf"
        output_dir = Path("test_models")
        
        print(f"📥 Testing download from {repo_id}")
        print(f"📁 Output directory: {output_dir}")
        
        # Ensure output directory exists
        output_dir.mkdir(exist_ok=True)
        
        # Download the model file
        print("📥 Downloading model file...")
        downloaded_path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            cache_dir=None,
            local_dir=None,
        )
        
        print(f"✅ Downloaded to cache: {downloaded_path}")
        
        # Copy to our test directory
        model_path = output_dir / filename
        shutil.copy2(downloaded_path, model_path)
        
        if model_path.exists():
            size_mb = model_path.stat().st_size / (1024 * 1024)
            print(f"✅ Model copied successfully!")
            print(f"📊 File: {model_path}")
            print(f"📊 Size: {size_mb:.1f} MB")
            
            # Clean up test directory
            shutil.rmtree(output_dir)
            print("🧹 Cleaned up test directory")
            
            return True
        else:
            print("❌ Model file not found after copy")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Install with: pip install huggingface_hub")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_download()
    if success:
        print("🎉 Download test passed!")
        sys.exit(0)
    else:
        print("❌ Download test failed!")
        sys.exit(1)
