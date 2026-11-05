#!/usr/bin/env python3

import os
import signal
import socket
import subprocess
import sys
import time
import webbrowser
from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

ROOT_DIR = Path(__file__).resolve().parent

BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
VENV_DIR = ROOT_DIR / ".venv"

FASTAPI_BIN = VENV_DIR / "bin" / "fastapi"

BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8000

FRONTEND_HOST = "127.0.0.1"
FRONTEND_PORT = 5173

FRONTEND_URL = f"http://{FRONTEND_HOST}:{FRONTEND_PORT}"

processes = []


# ============================================================
# UTILITIES
# ============================================================

def print_title():
    print()
    print("=" * 65)
    print("        AI SECURITY TESTING PLATFORM")
    print("        OWASP Top 10 for LLM Applications")
    print("=" * 65)
    print()


def check_file(path: Path, name: str):
    if not path.exists():
        print(f"[ERROR] {name} not found:")
        print(f"        {path}")
        sys.exit(1)


def port_is_open(host: str, port: int) -> bool:
    try:
        with socket.create_connection(
            (host, port),
            timeout=1
        ):
            return True
    except OSError:
        return False


def wait_for_port(
    host: str,
    port: int,
    service_name: str,
    timeout: int = 30
):
    print(
        f"[WAIT] Waiting for {service_name} "
        f"on {host}:{port}..."
    )

    start_time = time.time()

    while time.time() - start_time < timeout:
        if port_is_open(host, port):
            print(f"[OK] {service_name} is ready.")
            return True

        time.sleep(0.5)

    print(
        f"[ERROR] {service_name} did not start "
        f"within {timeout} seconds."
    )

    return False


# ============================================================
# POSTGRESQL / DOCKER
# ============================================================

def start_database():
    print("[1/3] Starting PostgreSQL with Docker...")

    try:
        result = subprocess.run(
            [
                "docker",
                "compose",
                "up",
                "-d",
            ],
            cwd=ROOT_DIR,
            check=False,
        )

    except FileNotFoundError:
        print("[ERROR] Docker command not found.")
        sys.exit(1)

    if result.returncode != 0:
        print()
        print("[ERROR] Docker Compose could not start.")
        print()
        print(
            "If you see 'permission denied' for "
            "/var/run/docker.sock, run:"
        )
        print()
        print("    newgrp docker")
        print()
        sys.exit(1)

    print("[OK] PostgreSQL container started.")
    print()


# ============================================================
# FASTAPI
# ============================================================

def start_backend():
    print("[2/3] Starting FastAPI backend...")

    check_file(
        FASTAPI_BIN,
        "FastAPI executable"
    )

    command = [
        str(FASTAPI_BIN),
        "dev",
        "backend/app/main.py",
        "--host",
        BACKEND_HOST,
        "--port",
        str(BACKEND_PORT),
    ]

    process = subprocess.Popen(
        command,
        cwd=ROOT_DIR,
        start_new_session=True,
    )

    processes.append(
        ("FastAPI", process)
    )

    return process


# ============================================================
# REACT / VITE
# ============================================================

def start_frontend():
    print("[3/3] Starting React frontend...")

    package_json = FRONTEND_DIR / "package.json"

    check_file(
        package_json,
        "frontend/package.json"
    )

    nvm_script = Path.home() / ".nvm" / "nvm.sh"

    check_file(
        nvm_script,
        "NVM"
    )

    command = f"""
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 24 >/dev/null

cd "{FRONTEND_DIR}"

npm run dev -- \
    --host {FRONTEND_HOST} \
    --port {FRONTEND_PORT}
"""

    process = subprocess.Popen(
        [
            "bash",
            "-lc",
            command,
        ],
        cwd=FRONTEND_DIR,
        start_new_session=True,
    )

    processes.append(
        ("React/Vite", process)
    )

    return process


# ============================================================
# CLEANUP
# ============================================================

def stop_process(name, process):
    if process.poll() is not None:
        return

    print(f"[STOP] Stopping {name}...")

    try:
        os.killpg(
            os.getpgid(process.pid),
            signal.SIGTERM
        )

        process.wait(timeout=5)

    except Exception:
        try:
            os.killpg(
                os.getpgid(process.pid),
                signal.SIGKILL
            )
        except Exception:
            pass


def cleanup():
    print()
    print("=" * 65)
    print("Stopping AI Security Testing Platform")
    print("=" * 65)

    for name, process in reversed(processes):
        stop_process(
            name,
            process
        )

    print("[STOP] Stopping PostgreSQL container...")

    subprocess.run(
        [
            "docker",
            "compose",
            "stop",
        ],
        cwd=ROOT_DIR,
        check=False,
    )

    print()
    print("[OK] Platform stopped.")
    print()


# ============================================================
# MAIN
# ============================================================

def main():
    print_title()

    check_file(
        ROOT_DIR / "compose.yaml",
        "compose.yaml"
    )

    check_file(
        ROOT_DIR / "backend" / "app" / "main.py",
        "backend/app/main.py"
    )

    check_file(
        ROOT_DIR / "frontend" / "package.json",
        "frontend/package.json"
    )

    # --------------------------------------------------------
    # Database
    # --------------------------------------------------------

    start_database()

    # --------------------------------------------------------
    # Backend
    # --------------------------------------------------------

    backend_process = start_backend()

    if not wait_for_port(
        BACKEND_HOST,
        BACKEND_PORT,
        "FastAPI",
        timeout=30,
    ):
        cleanup()
        sys.exit(1)

    # --------------------------------------------------------
    # Frontend
    # --------------------------------------------------------

    frontend_process = start_frontend()

    if not wait_for_port(
        FRONTEND_HOST,
        FRONTEND_PORT,
        "React/Vite",
        timeout=40,
    ):
        cleanup()
        sys.exit(1)

    # --------------------------------------------------------
    # Ready
    # --------------------------------------------------------

    print()
    print("=" * 65)
    print("PLATFORM READY")
    print("=" * 65)

    print()
    print(
        f"Frontend : {FRONTEND_URL}"
    )

    print(
        f"Backend  : "
        f"http://{BACKEND_HOST}:{BACKEND_PORT}"
    )

    print(
        f"Swagger  : "
        f"http://{BACKEND_HOST}:{BACKEND_PORT}/docs"
    )

    print(
        "Database : PostgreSQL / Docker"
    )

    print()
    print(
        "Press CTRL+C to stop the platform."
    )
    print()

    # Open the React UI automatically
    time.sleep(1)

    webbrowser.open(
        FRONTEND_URL
    )

    # --------------------------------------------------------
    # Monitor processes
    # --------------------------------------------------------

    try:
        while True:

            if backend_process.poll() is not None:
                print()
                print(
                    "[ERROR] FastAPI stopped unexpectedly."
                )
                break

            if frontend_process.poll() is not None:
                print()
                print(
                    "[ERROR] React/Vite stopped unexpectedly."
                )
                break

            time.sleep(1)

    except KeyboardInterrupt:
        print()
        print(
            "CTRL+C received."
        )

    finally:
        cleanup()


if __name__ == "__main__":
    main()
