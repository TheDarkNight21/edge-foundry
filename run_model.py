#!/usr/bin/env python3
"""
CLI tool for running the TinyLlama model with custom prompts.
Usage: python run_model.py --prompt "Hello, world"
"""

import argparse
import sys
from load_model import load_model, run_model


def main():
    """Main CLI function that handles argument parsing and model execution."""
    parser = argparse.ArgumentParser(
        description="Run TinyLlama model with a custom prompt",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_model.py --prompt "Hello, world"
  python run_model.py --prompt "What is the capital of France?"
        """
    )
    
    parser.add_argument(
        "--prompt",
        type=str,
        required=True,
        help="The prompt to send to the model"
    )
    
    args = parser.parse_args()
    
    try:
        # Load the model
        print("Loading model...", file=sys.stderr)
        llm = load_model()
        print("Model loaded successfully!", file=sys.stderr)
        
        # Run the model with the provided prompt
        print("Generating response...", file=sys.stderr)
        result = run_model(args.prompt, llm)
        
        # Extract and print the response
        response_text = result["choices"][0]["text"]
        print(response_text)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
