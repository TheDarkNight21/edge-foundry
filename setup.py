#!/usr/bin/env python3
"""
Setup script for Edge Foundry CLI
"""

from setuptools import setup, find_packages

setup(
    name="edgefoundry",
    version="1.0.0",
    description="Edge Foundry - Local AI Agent Management CLI",
    author="Edge Foundry Team",
    packages=find_packages(),
    install_requires=[
        "llama-cpp-python==0.3.16",
        "huggingface_hub==0.35.3",
        "hf_xet==1.1.0",
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "pyyaml==6.0.1",
        "typer==0.9.0",
        "psutil==5.9.6",
        "rich==13.7.0",
    ],
    entry_points={
        "console_scripts": [
            "edgefoundry=cli:app",
        ],
    },
    python_requires=">=3.8",
)
