#!/usr/bin/env python3
"""
Standalone script to download models for Edge Foundry.
This can be used independently of the CLI.
"""

import argparse
import sys
from pathlib import Path

def download_model(repo_id: str, filename: str, output_dir: str = "models"):
    """Download a model from Hugging Face."""
    try:
        from huggingface_hub import hf_hub_download
        import shutil
        
        # Ensure output directory exists
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        print(f"📥 Downloading {filename} from {repo_id}...")
        print(f"📁 Output directory: {output_path.absolute()}")
        
        # Download the model file using huggingface_hub
        print("📥 Downloading model file...")
        downloaded_path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            cache_dir=None,  # Use default cache
            local_dir=None,  # Don't extract to local dir yet
        )
        
        # Copy the downloaded file to our output directory
        print("📁 Moving model to output directory...")
        model_path = output_path / filename
        shutil.copy2(downloaded_path, model_path)
        
        if model_path.exists():
            size_mb = model_path.stat().st_size / (1024 * 1024)
            print(f"✅ Model downloaded successfully!")
            print(f"📊 File: {model_path}")
            print(f"📊 Size: {size_mb:.1f} MB")
            return True
        else:
            print("❌ Model file not found after download")
            return False
            
    except ImportError:
        print("❌ huggingface_hub not installed.")
        print("Install with: pip install huggingface_hub")
        return False
    except Exception as e:
        print(f"❌ Error downloading model: {e}")
        return False

def main():
    """Main function for command line usage."""
    parser = argparse.ArgumentParser(
        description="Download models for Edge Foundry",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python download_model.py
  python download_model.py --repo microsoft/DialoGPT-medium --filename model.gguf
  python download_model.py --output-dir ./my_models
        """
    )
    
    parser.add_argument(
        "--repo", "-r",
        default="TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
        help="Hugging Face repository ID (default: TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF)"
    )
    
    parser.add_argument(
        "--filename", "-f",
        default="tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
        help="Model filename to download (default: tinyllama-1.1b-chat-v1.0.Q8_0.gguf)"
    )
    
    parser.add_argument(
        "--output-dir", "-o",
        default="models",
        help="Output directory for the model (default: models)"
    )
    
    args = parser.parse_args()
    
    success = download_model(args.repo, args.filename, args.output_dir)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
