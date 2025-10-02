#!/usr/bin/env python3
"""
Edge Foundry CLI - Command line interface for managing the Edge Foundry agent.
"""

import os
import sys
import json
import time
import shutil
import signal
import subprocess
import psutil
from pathlib import Path
from typing import Optional
import typer
import yaml
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from telemetry import TelemetryDB

app = typer.Typer(help="Edge Foundry - Local AI Agent Management CLI")
console = Console()

# Configuration
WORKING_DIR = Path("./.edgefoundry")
CONFIG_FILE = WORKING_DIR / "edgefoundry.yaml"
PID_FILE = WORKING_DIR / "agent.pid"
LOG_FILE = WORKING_DIR / "agent.log"
MODELS_DIR = WORKING_DIR / "models"

def ensure_working_dir():
    """Ensure the working directory exists."""
    WORKING_DIR.mkdir(exist_ok=True)
    MODELS_DIR.mkdir(exist_ok=True)

def get_agent_pid():
    """Get the agent process ID if running."""
    if PID_FILE.exists():
        try:
            with open(PID_FILE, 'r') as f:
                pid = int(f.read().strip())
            if psutil.pid_exists(pid):
                return pid
        except (ValueError, FileNotFoundError):
            pass
    return None

def is_agent_running():
    """Check if the agent is currently running."""
    pid = get_agent_pid()
    if pid:
        try:
            process = psutil.Process(pid)
            return process.is_running() and "uvicorn" in " ".join(process.cmdline())
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return False

@app.command()
def init():
    """Initialize Edge Foundry in the current directory."""
    console.print("Initializing Edge Foundry...", style="bold blue")
    
    ensure_working_dir()
    
    # Create default config if it doesn't exist
    if not CONFIG_FILE.exists():
        default_config = {
            "model_path": "./models/tinyllama.gguf",
            "runtime": "llama_cpp",
            "device": "local",
            "port": 8000,
            "host": "0.0.0.0"
        }
        
        with open(CONFIG_FILE, 'w') as f:
            yaml.dump(default_config, f, default_flow_style=False)
        
        console.print(f"✅ Created default config at {CONFIG_FILE}")
    
    # Create .gitignore for working directory
    gitignore_path = WORKING_DIR / ".gitignore"
    if not gitignore_path.exists():
        with open(gitignore_path, 'w') as f:
            f.write("*.pid\n*.log\nmodels/\n")
        console.print(f"✅ Created .gitignore at {gitignore_path}")
    
    console.print("🎉 Edge Foundry initialized successfully!", style="bold green")

@app.command()
def deploy(
    model: str = typer.Option(..., "--model", "-m", help="Path to the model file to deploy"),
    config: Optional[str] = typer.Option(None, "--config", "-c", help="Path to config file")
):
    """Deploy a model and configuration to the working directory."""
    console.print(f"📦 Deploying model: {model}", style="bold blue")
    
    ensure_working_dir()
    
    # Copy model file
    model_path = Path(model)
    if not model_path.exists():
        console.print(f"❌ Model file not found: {model}", style="bold red")
        raise typer.Exit(1)
    
    target_model_path = MODELS_DIR / model_path.name
    shutil.copy2(model_path, target_model_path)
    console.print(f"✅ Model copied to {target_model_path}")
    
    # Copy or create config
    if config:
        config_path = Path(config)
        if not config_path.exists():
            console.print(f"❌ Config file not found: {config}", style="bold red")
            raise typer.Exit(1)
        shutil.copy2(config_path, CONFIG_FILE)
        console.print(f"✅ Config copied to {CONFIG_FILE}")
    else:
        # Update existing config with model path
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r') as f:
                config_data = yaml.safe_load(f)
        else:
            config_data = {}
        
        config_data["model_path"] = f"./models/{model_path.name}"
        config_data["runtime"] = "llama_cpp"
        config_data["device"] = "local"
        config_data["port"] = 8000
        config_data["host"] = "0.0.0.0"
        
        with open(CONFIG_FILE, 'w') as f:
            yaml.dump(config_data, f, default_flow_style=False)
        console.print(f"✅ Config updated at {CONFIG_FILE}")
    
    console.print("🎉 Deployment completed successfully!", style="bold green")

@app.command()
def start():
    """Start the Edge Foundry agent in the background."""
    if is_agent_running():
        console.print("⚠️  Agent is already running!", style="bold yellow")
        return
    
    if not CONFIG_FILE.exists():
        console.print("❌ No configuration found. Run 'edgefoundry init' first.", style="bold red")
        raise typer.Exit(1)
    
    console.print("🚀 Starting Edge Foundry agent...", style="bold blue")
    
    # Start the agent in background
    cmd = [sys.executable, "-m", "uvicorn", "agent:app", "--host", "0.0.0.0", "--port", "8000"]
    
    with open(LOG_FILE, 'w') as log_file:
        process = subprocess.Popen(
            cmd,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd=WORKING_DIR
        )
    
    # Save PID
    with open(PID_FILE, 'w') as f:
        f.write(str(process.pid))
    
    # Wait a moment and check if it started successfully
    time.sleep(2)
    if is_agent_running():
        console.print("✅ Agent started successfully!", style="bold green")
        console.print(f"📊 Logs: {LOG_FILE}")
        console.print("🌐 API: http://localhost:8000")
    else:
        console.print("❌ Failed to start agent. Check logs for details.", style="bold red")
        raise typer.Exit(1)

@app.command()
def stop():
    """Stop the Edge Foundry agent."""
    if not is_agent_running():
        console.print("⚠️  Agent is not running.", style="bold yellow")
        return
    
    pid = get_agent_pid()
    if pid:
        try:
            process = psutil.Process(pid)
            process.terminate()
            process.wait(timeout=10)
            console.print("✅ Agent stopped successfully!", style="bold green")
        except (psutil.NoSuchProcess, psutil.TimeoutExpired):
            console.print("⚠️  Agent process not found or didn't stop gracefully.", style="bold yellow")
        finally:
            if PID_FILE.exists():
                PID_FILE.unlink()
    else:
        console.print("⚠️  No PID file found.", style="bold yellow")

@app.command()
def status():
    """Show the current status of the Edge Foundry agent."""
    if is_agent_running():
        pid = get_agent_pid()
        process = psutil.Process(pid)
        
        # Get process info
        memory_info = process.memory_info()
        cpu_percent = process.cpu_percent()
        create_time = process.create_time()
        uptime = time.time() - create_time
        
        # Create status table
        table = Table(title="Edge Foundry Agent Status")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Status", "🟢 Running")
        table.add_row("PID", str(pid))
        table.add_row("Uptime", f"{uptime:.1f} seconds")
        table.add_row("Memory", f"{memory_info.rss / 1024 / 1024:.1f} MB")
        table.add_row("CPU", f"{cpu_percent:.1f}%")
        table.add_row("API URL", "http://localhost:8000")
        
        console.print(table)
        
        # Show recent logs
        if LOG_FILE.exists():
            console.print("\n📋 Recent logs:")
            try:
                with open(LOG_FILE, 'r') as f:
                    lines = f.readlines()
                    recent_lines = lines[-10:]  # Last 10 lines
                    for line in recent_lines:
                        console.print(f"  {line.strip()}")
            except Exception as e:
                console.print(f"  Could not read logs: {e}")
    else:
        console.print("🔴 Agent is not running", style="bold red")
        
        # Show config info
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r') as f:
                config = yaml.safe_load(f)
            console.print(f"\n📋 Configuration: {CONFIG_FILE}")
            console.print(f"  Model: {config.get('model_path', 'Not set')}")
            console.print(f"  Runtime: {config.get('runtime', 'Not set')}")
            console.print(f"  Device: {config.get('device', 'Not set')}")

@app.command()
def logs():
    """Show recent agent logs."""
    if not LOG_FILE.exists():
        console.print("❌ No log file found. Agent may not have been started.", style="bold red")
        return
    
    console.print(f"📋 Recent logs from {LOG_FILE}:", style="bold blue")
    console.print("-" * 50)
    
    try:
        with open(LOG_FILE, 'r') as f:
            lines = f.readlines()
            # Show last 50 lines
            recent_lines = lines[-50:]
            for line in recent_lines:
                console.print(line.rstrip())
    except Exception as e:
        console.print(f"❌ Error reading logs: {e}", style="bold red")

@app.command()
def clean(
    force: bool = typer.Option(False, "--force", "-f", help="Force clean without confirmation"),
    keep_models: bool = typer.Option(False, "--keep-models", help="Keep model files during clean"),
    keep_config: bool = typer.Option(False, "--keep-config", help="Keep configuration files during clean")
):
    """Clean up temporary files, logs, and reset the working directory."""
    if is_agent_running():
        console.print("⚠️  Agent is currently running. Please stop it first with 'edgefoundry stop'.", style="bold yellow")
        raise typer.Exit(1)
    
    # Show what will be cleaned
    files_to_clean = []
    dirs_to_clean = []
    
    if WORKING_DIR.exists():
        for item in WORKING_DIR.iterdir():
            if item.is_file():
                if item.name == "agent.pid":
                    files_to_clean.append(item)
                elif item.name == "agent.log":
                    files_to_clean.append(item)
                elif item.name == "edgefoundry.yaml" and not keep_config:
                    files_to_clean.append(item)
            elif item.is_dir() and item.name == "models" and not keep_models:
                dirs_to_clean.append(item)
    
    if not files_to_clean and not dirs_to_clean:
        console.print("✨ Working directory is already clean!", style="bold green")
        return
    
    # Show what will be cleaned
    console.print("🧹 [bold blue]Cleanup Preview[/bold blue]")
    console.print("The following items will be removed:")
    
    for file_path in files_to_clean:
        console.print(f"  📄 {file_path}")
    
    for dir_path in dirs_to_clean:
        console.print(f"  📁 {dir_path}")
    
    # Confirm unless forced
    if not force:
        if not typer.confirm("\nDo you want to proceed with the cleanup?"):
            console.print("❌ Cleanup cancelled.", style="bold yellow")
            return
    
    # Perform cleanup
    cleaned_count = 0
    
    try:
        # Remove files
        for file_path in files_to_clean:
            if file_path.exists():
                file_path.unlink()
                console.print(f"✅ Removed {file_path}")
                cleaned_count += 1
        
        # Remove directories
        for dir_path in dirs_to_clean:
            if dir_path.exists():
                shutil.rmtree(dir_path)
                console.print(f"✅ Removed {dir_path}")
                cleaned_count += 1
        
        # Clean up telemetry database if it exists
        telemetry_db_path = Path("telemetry.db")
        if telemetry_db_path.exists():
            if force or typer.confirm(f"\nRemove telemetry database ({telemetry_db_path})?"):
                telemetry_db_path.unlink()
                console.print(f"✅ Removed {telemetry_db_path}")
                cleaned_count += 1
        
        # Clean up __pycache__ directories
        for pycache_dir in Path(".").rglob("__pycache__"):
            if pycache_dir.is_dir():
                shutil.rmtree(pycache_dir)
                console.print(f"✅ Removed {pycache_dir}")
                cleaned_count += 1
        
        if cleaned_count > 0:
            console.print(f"\n🎉 Cleanup completed! Removed {cleaned_count} items.", style="bold green")
        else:
            console.print("\n✨ Nothing to clean!", style="bold green")
            
    except Exception as e:
        console.print(f"❌ Error during cleanup: {e}", style="bold red")
        raise typer.Exit(1)

@app.command()
def metrics(
    limit: int = typer.Option(20, "--limit", "-l", help="Number of recent records to show"),
    summary_only: bool = typer.Option(False, "--summary", "-s", help="Show only summary statistics")
):
    """Show telemetry metrics from the SQLite database."""
    try:
        # Initialize telemetry database
        db = TelemetryDB()
        
        # Get metrics data
        metrics_data = db.get_metrics_summary(limit)
        summary = metrics_data["summary"]
        recent_records = metrics_data["recent_records"]
        
        if summary["total_inferences"] == 0:
            console.print("📊 No telemetry data found. Run some inferences first!", style="bold yellow")
            return
        
        # Show summary
        console.print("\n📊 [bold blue]Telemetry Summary[/bold blue]")
        summary_table = Table(title="Overall Statistics")
        summary_table.add_column("Metric", style="cyan")
        summary_table.add_column("Value", style="green")
        
        summary_table.add_row("Total Inferences", str(summary["total_inferences"]))
        summary_table.add_row("Average Latency", f"{summary['avg_latency_ms']:.2f} ms")
        summary_table.add_row("Average Tokens/sec", f"{summary['avg_tokens_per_second']:.2f}")
        summary_table.add_row("Average Memory Usage", f"{summary['avg_memory_mb']:.2f} MB")
        summary_table.add_row("First Inference", summary["first_inference"] or "N/A")
        summary_table.add_row("Last Inference", summary["last_inference"] or "N/A")
        
        console.print(summary_table)
        
        if not summary_only and recent_records:
            # Show recent records
            console.print(f"\n📋 [bold blue]Recent Records (Last {len(recent_records)})[/bold blue]")
            records_table = Table(title="Recent Inference Records")
            records_table.add_column("Timestamp", style="cyan", width=20)
            records_table.add_column("Prompt Tokens", style="yellow", justify="right")
            records_table.add_column("Latency (ms)", style="green", justify="right")
            records_table.add_column("Generated Tokens", style="yellow", justify="right")
            records_table.add_column("Tokens/sec", style="green", justify="right")
            records_table.add_column("Memory (MB)", style="blue", justify="right")
            records_table.add_column("Temperature", style="magenta", justify="right")
            
            for record in recent_records:
                timestamp = record[1][:19] if record[1] else "N/A"  # Truncate timestamp
                records_table.add_row(
                    timestamp,
                    str(record[2]),  # prompt_length
                    f"{record[3]:.1f}",  # latency_ms
                    str(record[4]),  # tokens_generated
                    f"{record[5]:.1f}",  # tokens_per_second
                    f"{record[6]:.1f}",  # memory_mb
                    f"{record[8]:.2f}" if record[8] else "N/A"  # temperature
                )
            
            console.print(records_table)
        
    except Exception as e:
        console.print(f"❌ Error reading telemetry data: {e}", style="bold red")
        console.print("Make sure the agent has been running and generating telemetry data.", style="yellow")

if __name__ == "__main__":
    app()
