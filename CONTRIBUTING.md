# Contributing to Brain Scroll

Thank you for your interest in contributing to Brain Scroll! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/brain-scroll.git
   cd brain-scroll
   ```
3. **Set up the development environment** (see README.md)
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Workflow

### 1. Code Standards

**JavaScript/Node.js**
- Follow ESLint configuration (`.eslintrc.json`)
- Use Prettier for formatting (`.prettierrc`)
- Write meaningful commit messages
- Add JSDoc comments for functions

**Python**
- Follow PEP 8 style guide
- Use Flake8 for linting (`.flake8`)
- Maximum line length: 100 characters
- Add docstrings for functions and classes

**General**
- Follow EditorConfig settings (`.editorconfig`)
- Use 2 spaces for JS/JSON, 4 spaces for Python
- Unix line endings (LF)
- Trim trailing whitespace

### 2. Testing

Always write tests for new features:

**Backend**
```bash
cd backend/scraper
python test_scraper.py
```

**API**
```bash
cd api
npm test
```

**Frontend**
```bash
cd frontend
npm test
```

### 3. Linting and Formatting

Before committing, run:

```bash
make lint    # Check code style
make format  # Auto-format code
```

Or manually:

**Backend**
```bash
cd backend/scraper
flake8 .
black .
```

**API/Frontend**
```bash
npm run lint
npm run format
```

## 🔀 Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Run all tests** to ensure nothing breaks
4. **Update CHANGELOG.md** with your changes
5. **Create a Pull Request** with a clear title and description

### PR Title Format

Use conventional commits format:
- `feat: Add new feature`
- `fix: Fix bug in scraper`
- `docs: Update README`
- `style: Format code`
- `refactor: Restructure API routes`
- `test: Add tests for deduplication`
- `chore: Update dependencies`

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
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node/Python version, etc.
6. **Logs**: Relevant error messages or logs

## 💡 Suggesting Features

When suggesting features:

1. **Use Case**: Explain why this feature is needed
2. **Proposed Solution**: How it could work
3. **Alternatives**: Other approaches considered
4. **Additional Context**: Screenshots, mockups, etc.

## 📁 Project Structure

Understanding the structure helps with contributions:

```
brain-scroll/
├── backend/scraper/      # Python scraper with agentic architecture
├── api/                  # Node.js Express API
├── frontend/             # React frontend
├── .taskmaster/          # Project management
└── docker-compose.yml    # Container orchestration
```

## 🎯 Areas for Contribution

### High Priority
- [ ] API endpoint implementations
- [ ] Frontend components
- [ ] Test coverage improvements
- [ ] Documentation enhancements

### Medium Priority
- [ ] Performance optimizations
- [ ] Additional paper sources
- [ ] UI/UX improvements
- [ ] Accessibility features

### Low Priority
- [ ] Code refactoring
- [ ] Additional integrations
- [ ] Analytics features

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainers directly
3. Include detailed information
4. Allow time for a fix before disclosure

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other unprofessional conduct

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Chat**: Join our community (link TBD)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to Brain Scroll! 🧠✨
