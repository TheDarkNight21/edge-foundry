#!/usr/bin/env python3
"""
Download demo models for Edge Foundry
Downloads TinyLlama and Phi-3 Mini models for demonstration purposes.
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from huggingface_hub import hf_hub_download

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Demo models configuration
DEMO_MODELS = {
    "tinyllama-1b-3bit": {
        "repo_id": "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
        "filename": "tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
        "local_path": "models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf"
    },
    "phi-3-mini": {
        "repo_id": "microsoft/Phi-3-mini-4k-instruct-gguf",
        "filename": "Phi-3-mini-4k-instruct-q4.gguf",
        "local_path": "models/phi-3-mini-4k-instruct.gguf"
    }
}


def ensure_models_directory():
    """Ensure the models directory exists"""
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    return models_dir


def download_model(model_id: str, force: bool = False) -> bool:
    """Download a specific demo model"""
    if model_id not in DEMO_MODELS:
        logger.error(f"Unknown model: {model_id}")
        logger.info(f"Available models: {', '.join(DEMO_MODELS.keys())}")
        return False
    
    model_config = DEMO_MODELS[model_id]
    local_path = Path(model_config["local_path"])
    
    # Check if model already exists
    if local_path.exists() and not force:
        logger.info(f"Model {model_id} already exists at {local_path}")
        return True
    
    try:
        logger.info(f"Downloading {model_id}...")
        logger.info(f"Repository: {model_config['repo_id']}")
        logger.info(f"Filename: {model_config['filename']}")
        
        # Ensure parent directory exists
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Download the model
        downloaded_path = hf_hub_download(
            repo_id=model_config["repo_id"],
            filename=model_config["filename"],
            local_dir=local_path.parent,
            local_dir_use_symlinks=False
        )
        
        # Rename to expected filename if needed
        if downloaded_path != str(local_path):
            os.rename(downloaded_path, local_path)
        
        logger.info(f"Successfully downloaded {model_id} to {local_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to download {model_id}: {e}")
        return False


def download_all_models(force: bool = False) -> bool:
    """Download all demo models"""
    ensure_models_directory()
    
    success = True
    for model_id in DEMO_MODELS.keys():
        if not download_model(model_id, force):
            success = False
    
    return success


def list_models():
    """List available demo models"""
    print("Available demo models:")
    print("-" * 50)
    for model_id, config in DEMO_MODELS.items():
        print(f"ID: {model_id}")
        print(f"  Repository: {config['repo_id']}")
        print(f"  Filename: {config['filename']}")
        print(f"  Local path: {config['local_path']}")
        print()


def check_models():
    """Check which models are already downloaded"""
    print("Model download status:")
    print("-" * 30)
    for model_id, config in DEMO_MODELS.items():
        local_path = Path(config["local_path"])
        status = "✓ Downloaded" if local_path.exists() else "✗ Not downloaded"
        size = f" ({local_path.stat().st_size / (1024**3):.1f} GB)" if local_path.exists() else ""
        print(f"{model_id}: {status}{size}")


def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(
        description="Download demo models for Edge Foundry",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python download_demo_models.py --all
  python download_demo_models.py --model tinyllama-1b-3bit
  python download_demo_models.py --list
  python download_demo_models.py --check
        """
    )
    
    parser.add_argument(
        "--all",
        action="store_true",
        help="Download all demo models"
    )
    
    parser.add_argument(
        "--model",
        type=str,
        help="Download a specific model by ID"
    )
    
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available demo models"
    )
    
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check which models are already downloaded"
    )
    
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-download even if model exists"
    )
    
    args = parser.parse_args()
    
    if args.list:
        list_models()
        return
    
    if args.check:
        check_models()
        return
    
    if args.all:
        success = download_all_models(args.force)
        if success:
            print("\n✓ All demo models downloaded successfully!")
        else:
            print("\n✗ Some models failed to download")
            sys.exit(1)
    elif args.model:
        success = download_model(args.model, args.force)
        if success:
            print(f"\n✓ Model {args.model} downloaded successfully!")
        else:
            print(f"\n✗ Failed to download model {args.model}")
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

