# Contributing to EdgeFoundry

Thank you for your interest in contributing to EdgeFoundry! 🚀

This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher (for dashboard development)
- Git
- A GitHub account

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/edge-foundry.git
   cd edge-foundry
   ```

2. **Set Up Backend**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   pip install -e .
   ```

3. **Set Up Frontend**
   ```bash
   cd dashboard
   npm install
   ```

4. **Run Tests**
   ```bash
   # Backend tests
   python test_cli.py
   python test_telemetry.py
   
   # Frontend tests
   cd dashboard
   npm test
   ```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
python -m pytest tests/

# Run specific test
python test_cli.py

# Test the full system
python cli.py init
python cli.py start
# Test your changes
python cli.py stop
```

## Submitting Changes

### 1. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit Message Format:**
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### 2. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** - Your issue might already be reported
2. **Check the documentation** - The answer might be in the docs
3. **Try the latest version** - Make sure you're using the latest code

### Bug Reports

Use the bug report template and include:

- **Clear description** of the bug
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Python version, etc.)
- **Error messages** and logs
- **Screenshots** if applicable

### Feature Requests

Use the feature request template and include:

- **Clear description** of the feature
- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives** - Other solutions you've considered

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of your code
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] New tests added (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## Coding Standards

### Python

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints where appropriate
- Write docstrings for functions and classes
- Keep functions small and focused

### JavaScript/React

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Use meaningful variable and function names
- Add PropTypes or TypeScript types

### General

- Write clear, self-documenting code
- Use meaningful commit messages
- Keep PRs focused and small
- Comment complex logic

## Testing

### Backend Testing

```bash
# Run all tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=edgefoundry

# Run specific test file
python test_cli.py
```

### Frontend Testing

```bash
cd dashboard
npm test
npm run test:coverage
```

### Manual Testing

1. **CLI Testing**
   ```bash
   python cli.py init
   python cli.py deploy --model path/to/model.gguf
   python cli.py start
   python cli.py status
   python cli.py inference "Test prompt"
   python cli.py stop
   ```

2. **API Testing**
   ```bash
   # Start agent
   python cli.py start
   
   # Test endpoints
   curl http://localhost:8000/health
   curl -X POST http://localhost:8000/inference \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello world"}'
   ```

3. **Dashboard Testing**
   ```bash
   cd dashboard
   npm start
   # Visit http://localhost:3000
   ```

## Documentation

### Code Documentation

- Add docstrings to all functions and classes
- Include type hints for function parameters
- Document complex algorithms or business logic

### User Documentation

- Update README.md for user-facing changes
- Add examples for new features
- Update API documentation for new endpoints

### Developer Documentation

- Document architectural decisions
- Add setup instructions for new dependencies
- Update development guidelines

## Areas for Contribution

### High Priority

- **Bug fixes** - Help us squash bugs
- **Documentation** - Improve guides and examples
- **Testing** - Add more test coverage
- **Performance** - Optimize model loading and inference

### Medium Priority

- **New features** - Add requested functionality
- **UI/UX improvements** - Enhance the dashboard
- **API extensions** - Add new endpoints
- **Model support** - Add support for new model formats

### Low Priority

- **Code refactoring** - Improve code structure
- **Tooling** - Add development tools
- **Examples** - Create more usage examples
- **Tutorials** - Write step-by-step guides

## Getting Help

- **Discussions** - Use GitHub Discussions for questions
- **Issues** - Create an issue for bugs or feature requests
- **Discord** - Join our community Discord (if available)
- **Email** - Contact maintainers directly

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

## Thank You

Thank you for contributing to EdgeFoundry! Your contributions help make local AI deployment accessible to everyone. 🙏

---

**Questions?** Feel free to open a discussion or reach out to the maintainers!
