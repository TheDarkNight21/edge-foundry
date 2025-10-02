# Quick Test Checklist

Use this checklist for a quick manual test of the backend functionality.

## ✅ Prerequisites
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Model downloaded: `python cli.py download` or `python download_model.py`

## ✅ Basic Functionality Test (5 minutes)

### 1. Initialize & Deploy
```bash
python cli.py init
python cli.py deploy --model models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
```
- [ ] No errors
- [ ] Configuration file created
- [ ] Model copied to working directory

### 2. Start Agent
```bash
python cli.py start
```
- [ ] Agent starts successfully
- [ ] No error messages
- [ ] Status shows "Running"

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Model info
curl http://localhost:8000/model-info

# Inference test
curl -X POST http://localhost:8000/inference \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "max_tokens": 10}'
```
- [ ] All endpoints respond
- [ ] Health check returns "healthy"
- [ ] Inference returns a response

### 4. Test CLI Commands
```bash
python cli.py status
python cli.py metrics
python cli.py logs
```
- [ ] Status shows running agent
- [ ] Metrics show inference data
- [ ] Logs display recent entries

### 5. Stop & Clean
```bash
python cli.py stop
python cli.py clean --force
```
- [ ] Agent stops cleanly
- [ ] Clean removes temporary files

## ✅ Success Criteria
- [ ] All commands execute without errors
- [ ] API responds to all endpoints
- [ ] Agent starts and stops cleanly
- [ ] Metrics are collected and displayed
- [ ] Clean command works properly

## 🚀 Ready for Frontend!
If all items are checked, your backend is solid and ready for frontend implementation!

---

**Time Estimate:** 5-10 minutes for quick test
**Full Pipeline:** Run `./test_pipeline.sh` (Linux/Mac) or `test_pipeline.bat` (Windows) for comprehensive testing
