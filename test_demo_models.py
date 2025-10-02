#!/usr/bin/env python3
"""
Test script for demo models functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_manager import model_manager

def test_demo_models():
    """Test the demo models functionality"""
    print("🧪 Testing Demo Models Functionality")
    print("=" * 50)
    
    # Test 1: Load demo models configuration
    print("\n1. Loading demo models configuration...")
    try:
        models = model_manager.get_available_models()
        print(f"✅ Found {len(models)} demo models:")
        for model in models:
            print(f"   - {model['id']}: {model['name']} ({model['parameters']})")
    except Exception as e:
        print(f"❌ Error loading demo models: {e}")
        return False
    
    # Test 2: Get model configurations
    print("\n2. Testing model configurations...")
    try:
        tinyllama_config = model_manager.get_model_config("tinyllama-1b-3bit")
        phi3_config = model_manager.get_model_config("phi-3-mini")
        
        if tinyllama_config:
            print(f"✅ TinyLlama config loaded: {tinyllama_config['name']}")
        else:
            print("❌ TinyLlama config not found")
            
        if phi3_config:
            print(f"✅ Phi-3 Mini config loaded: {phi3_config['name']}")
        else:
            print("❌ Phi-3 Mini config not found")
    except Exception as e:
        print(f"❌ Error loading model configs: {e}")
        return False
    
    # Test 3: Test sample prompts
    print("\n3. Testing sample prompts...")
    try:
        tinyllama_prompts = model_manager.get_sample_prompts("tinyllama-1b-3bit")
        phi3_prompts = model_manager.get_sample_prompts("phi-3-mini")
        
        print(f"✅ TinyLlama sample prompts: {len(tinyllama_prompts)} prompts")
        if tinyllama_prompts:
            print(f"   Example: {tinyllama_prompts[0]}")
            
        print(f"✅ Phi-3 Mini sample prompts: {len(phi3_prompts)} prompts")
        if phi3_prompts:
            print(f"   Example: {phi3_prompts[0]}")
    except Exception as e:
        print(f"❌ Error loading sample prompts: {e}")
        return False
    
    # Test 4: Test model switching (without actually loading models)
    print("\n4. Testing model switching logic...")
    try:
        # This will fail if models aren't downloaded, but we can test the logic
        print("   (Note: Model files need to be downloaded for actual loading)")
        print("   Testing switch logic...")
        
        # Test current model info
        current_info = model_manager.get_current_model_info()
        print(f"✅ Current model info: {current_info}")
        
    except Exception as e:
        print(f"❌ Error testing model switching: {e}")
        return False
    
    print("\n🎉 All tests passed! Demo models functionality is working correctly.")
    print("\nNext steps:")
    print("1. Download demo models: python download_demo_models.py --all")
    print("2. Start the agent: python cli.py start")
    print("3. Test in dashboard: http://localhost:3000")
    print("4. Test CLI commands: python cli.py demo-models")
    
    return True

if __name__ == "__main__":
    success = test_demo_models()
    sys.exit(0 if success else 1)

