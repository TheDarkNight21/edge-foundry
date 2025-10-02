#!/usr/bin/env python3
"""
EdgeFoundry Package Setup
Modern Python packaging configuration for EdgeFoundry.
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
readme_path = Path(__file__).parent / "README.md"
long_description = readme_path.read_text(encoding="utf-8") if readme_path.exists() else ""

# Read requirements
requirements_path = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_path.exists():
    with open(requirements_path, "r", encoding="utf-8") as f:
        requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]

setup(
    name="edge-foundry",
    version="1.0.0",
    description="Deploy, monitor, and manage local AI models with one CLI",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="EdgeFoundry Team",
    author_email="team@edgefoundry.dev",
    url="https://github.com/yourusername/edge-foundry",
    project_urls={
        "Homepage": "https://github.com/yourusername/edge-foundry",
        "Documentation": "https://github.com/yourusername/edge-foundry#readme",
        "Repository": "https://github.com/yourusername/edge-foundry.git",
        "Issues": "https://github.com/yourusername/edge-foundry/issues",
        "Changelog": "https://github.com/yourusername/edge-foundry/blob/main/CHANGELOG.md",
    },
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    py_modules=[
        "agent",
        "cli", 
        "model_manager",
        "telemetry",
        "load_model",
        "run_model",
    ],
    entry_points={
        "console_scripts": [
            "edgefoundry=cli:main",
        ],
    },
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "isort>=5.12.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
            "pre-commit>=3.0.0",
        ],
        "test": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "pytest-mock>=3.10.0",
            "httpx>=0.24.0",
        ],
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Monitoring",
        "Topic :: System :: Systems Administration",
    ],
    keywords=[
        "ai",
        "llm", 
        "local",
        "deployment",
        "monitoring",
        "cli",
        "fastapi",
        "llama",
        "gguf",
    ],
    include_package_data=True,
    zip_safe=False,
)