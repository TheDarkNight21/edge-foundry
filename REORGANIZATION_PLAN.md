# EdgeFoundry Repository Reorganization Plan

## Current Structure Analysis

The current repository has a flat structure with mixed concerns. Here's the proposed reorganization for better clarity and professional presentation.

## Proposed New Structure

```
edge-foundry/
├── 📁 .github/
│   ├── 📁 workflows/           # GitHub Actions CI/CD
│   ├── 📁 ISSUE_TEMPLATE/      # Issue templates
│   └── 📄 PULL_REQUEST_TEMPLATE.md
├── 📁 docs/                    # Documentation
│   ├── 📄 API.md              # API documentation
│   ├── 📄 DEPLOYMENT.md       # Deployment guides
│   └── 📄 TROUBLESHOOTING.md  # Troubleshooting guide
├── 📁 examples/               # Example configurations
│   ├── 📄 basic-setup.yaml
│   ├── 📄 production.yaml
│   └── 📄 custom-models.yaml
├── 📁 src/                    # Core source code
│   ├── 📁 edgefoundry/        # Main package
│   │   ├── 📄 __init__.py
│   │   ├── 📄 agent.py        # FastAPI application
│   │   ├── 📄 cli.py          # CLI interface
│   │   ├── 📄 model_manager.py
│   │   └── 📄 telemetry.py
│   └── 📁 scripts/            # Utility scripts
│       ├── 📄 download_models.py
│       └── 📄 setup.py
├── 📁 dashboard/              # React frontend (unchanged)
├── 📁 tests/                  # Test suite
│   ├── 📄 test_cli.py
│   ├── 📄 test_telemetry.py
│   └── 📄 test_demo_models.py
├── 📁 models/                 # Model storage (unchanged)
├── 📁 .edgefoundry/          # Runtime directory (unchanged)
├── 📄 README.md              # Main documentation
├── 📄 CONTRIBUTING.md        # Contribution guidelines
├── 📄 CHANGELOG.md           # Version history
├── 📄 ROADMAP.md             # Future plans
├── 📄 LICENSE                # MIT License
├── 📄 requirements.txt       # Python dependencies
├── 📄 setup.py              # Package configuration
├── 📄 pyproject.toml        # Modern Python packaging
├── 📄 .gitignore            # Git ignore rules
└── 📄 .pre-commit-config.yaml # Code quality hooks
```

## File Movement Plan

### Phase 1: Create New Directories
```bash
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p docs
mkdir -p examples
mkdir -p src/edgefoundry
mkdir -p src/scripts
mkdir -p tests
```

### Phase 2: Move Core Files
```bash
# Move main Python files to src/edgefoundry/
mv agent.py src/edgefoundry/
mv cli.py src/edgefoundry/
mv model_manager.py src/edgefoundry/
mv telemetry.py src/edgefoundry/
mv load_model.py src/edgefoundry/
mv run_model.py src/edgefoundry/

# Move utility scripts
mv download_demo_models.py src/scripts/
mv download_model.py src/scripts/

# Move test files
mv test_*.py tests/
```

### Phase 3: Create Package Structure
```bash
# Create __init__.py files
touch src/edgefoundry/__init__.py
touch src/scripts/__init__.py
touch tests/__init__.py
```

### Phase 4: Update Import Paths
All Python files will need import path updates:
- `from agent import app` → `from edgefoundry.agent import app`
- `from cli import main` → `from edgefoundry.cli import main`
- etc.

## Benefits of This Structure

### 1. **Professional Organization**
- Clear separation of concerns
- Standard Python package structure
- Follows Python packaging best practices

### 2. **Better Developer Experience**
- Easier to find specific functionality
- Clear entry points for different components
- Standardized testing structure

### 3. **Community-Friendly**
- Familiar structure for contributors
- Clear documentation organization
- Easy to navigate for new users

### 4. **Scalability**
- Easy to add new features
- Clear boundaries between components
- Supports future modularization

## Implementation Priority

### High Priority (Before Launch)
1. Create `docs/` directory with key documentation
2. Create `examples/` directory with sample configs
3. Move test files to `tests/` directory
4. Create GitHub issue templates

### Medium Priority (Post-Launch)
1. Reorganize source code into `src/` structure
2. Update all import paths
3. Add CI/CD workflows
4. Add pre-commit hooks

### Low Priority (Future)
1. Split into multiple packages if needed
2. Add more comprehensive documentation
3. Create Docker configurations

## Migration Script

Here's a script to automate the reorganization:

```bash
#!/bin/bash
# reorganization.sh

echo "🚀 Reorganizing EdgeFoundry repository..."

# Create directories
mkdir -p .github/workflows .github/ISSUE_TEMPLATE docs examples src/edgefoundry src/scripts tests

# Move files
mv agent.py cli.py model_manager.py telemetry.py load_model.py run_model.py src/edgefoundry/
mv download_demo_models.py download_model.py src/scripts/
mv test_*.py tests/

# Create __init__.py files
touch src/edgefoundry/__init__.py src/scripts/__init__.py tests/__init__.py

# Move documentation
mv DEMO_MODELS.md docs/
mv TESTING_GUIDE.md docs/
mv TESTING_PIPELINE.md docs/

echo "✅ Reorganization complete!"
echo "⚠️  Remember to update import paths in all Python files"
```

## Alternative: Minimal Reorganization

If full reorganization is too complex, here's a minimal approach:

```
edge-foundry/
├── 📁 docs/                   # Move all .md files here
├── 📁 examples/               # Sample configurations
├── 📁 .github/                # GitHub templates
├── 📄 [existing files]        # Keep current structure
└── 📄 [new files]             # Add new documentation
```

This approach maintains the current structure while adding professional touches.
