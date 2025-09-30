# Edge Foundry Telemetry Testing Guide

This guide provides test commands and procedures for the newly implemented telemetry system in Edge Foundry.

## Overview

The telemetry system tracks:
- **Prompt length** (approximate token count)
- **Latency** (start–end time in milliseconds)
- **Tokens/sec** (generation speed)
- **Memory usage** (via psutil)
- **Model parameters** (temperature, max_tokens, model_path)

All data is stored in a local SQLite database (`telemetry.db`).

## Test Commands for Windows Environment

### 1. Test Telemetry Database (No Model Required)

```bash
# Run the telemetry test suite
python test_telemetry.py
```

This will:
- Create a test SQLite database
- Generate 15 sample telemetry records
- Test all database functions
- Show memory usage and token counting
- Optionally test API calls (if agent is running)

### 2. Test CLI Metrics Command

```bash
# View telemetry metrics (requires telemetry.db to exist)
python cli.py metrics

# View only summary statistics
python cli.py metrics --summary

# View more recent records
python cli.py metrics --limit 50
```

### 3. Test Full System (With Model)

If you have a model available on Windows:

```bash
# Initialize Edge Foundry
python cli.py init

# Deploy a model (replace with your model path)
python cli.py deploy --model "C:\path\to\your\model.gguf"

# Start the agent
python cli.py start

# Check status
python cli.py status

# View logs
python cli.py logs
```

### 4. Test API Endpoints

Once the agent is running, test the inference endpoint:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test inference endpoint (Windows PowerShell)
$body = @{
    prompt = "Hello, how are you?"
    max_tokens = 64
    temperature = 0.7
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/inference" -Method POST -Body $body -ContentType "application/json"

# Or using Python requests
python -c "
import requests
response = requests.post('http://localhost:8000/inference', json={
    'prompt': 'What is the capital of France?',
    'max_tokens': 64,
    'temperature': 0.7
})
print(response.json())
"
```

### 5. View Telemetry Data

After running inferences, view the collected data:

```bash
# View metrics summary
python cli.py metrics

# View detailed recent records
python cli.py metrics --limit 20

# View only summary statistics
python cli.py metrics --summary
```

## Database Schema

The telemetry data is stored in `telemetry.db` with the following schema:

```sql
CREATE TABLE telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    prompt_length INTEGER NOT NULL,
    latency_ms REAL NOT NULL,
    tokens_generated INTEGER NOT NULL,
    tokens_per_second REAL NOT NULL,
    memory_mb REAL NOT NULL,
    model_path TEXT,
    temperature REAL,
    max_tokens INTEGER
);
```

## Direct Database Access

You can also query the database directly:

```bash
# Using sqlite3 command line
sqlite3 telemetry.db "SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 10;"

# Using Python
python -c "
from telemetry import TelemetryDB
db = TelemetryDB()
data = db.get_metrics_summary(10)
print('Total inferences:', data['summary']['total_inferences'])
print('Average latency:', data['summary']['avg_latency_ms'], 'ms')
"
```

## Expected Output

### CLI Metrics Command Output

```
📊 Telemetry Summary
┌─────────────────────┬──────────────┐
│ Metric              │ Value        │
├─────────────────────┼──────────────┤
│ Total Inferences    │ 15           │
│ Average Latency     │ 1250.50 ms   │
│ Average Tokens/sec  │ 12.45        │
│ Average Memory Usage│ 45.20 MB     │
│ First Inference     │ 2024-01-15T10:30:00 │
│ Last Inference      │ 2024-01-15T10:35:00 │
└─────────────────────┴──────────────┘

📋 Recent Records (Last 10)
┌─────────────────────┬──────────────┬─────────────┬─────────────────┬─────────────┬─────────────┬─────────────┐
│ Timestamp           │ Prompt Tokens│ Latency (ms)│ Generated Tokens│ Tokens/sec  │ Memory (MB) │ Temperature │
├─────────────────────┼──────────────┼─────────────┼─────────────────┼─────────────┼─────────────┼─────────────┤
│ 2024-01-15T10:35:00 │ 25           │ 1200.5      │ 32              │ 26.7        │ 45.2        │ 0.70        │
└─────────────────────┴──────────────┴─────────────┴─────────────────┴─────────────┴─────────────┴─────────────┘
```

## Troubleshooting

### No Telemetry Data Found
- Ensure the agent is running: `python cli.py status`
- Check if `telemetry.db` exists in the current directory
- Verify the agent is processing requests successfully

### Database Errors
- Check file permissions for `telemetry.db`
- Ensure SQLite is available (included with Python)
- Try deleting `telemetry.db` to recreate the schema

### Memory Usage Issues
- The memory measurement shows the difference between start and end of inference
- Large models may show negative memory usage due to memory optimization
- This is normal behavior for the current implementation

## Files Created

- `telemetry.py` - Core telemetry functionality
- `test_telemetry.py` - Test suite for telemetry system
- `telemetry.db` - SQLite database (created automatically)
- Updated `agent.py` - Added telemetry logging to inference endpoint
- Updated `cli.py` - Added `metrics` command

## Next Steps

1. Run `python test_telemetry.py` to verify the system works
2. Deploy your model and start the agent
3. Make some inference requests
4. Use `python cli.py metrics` to view the collected data
5. Monitor performance over time using the telemetry data
