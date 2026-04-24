"""Shared helpers for processing scripts."""
import json
import sys
import time
import os


def read_payload():
    return json.loads(sys.stdin.read() or "{}")


def emit(payload):
    # Last line of stdout must be JSON
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()


def out_path(output_dir, name):
    os.makedirs(output_dir, exist_ok=True)
    return os.path.join(output_dir, f"{int(time.time())}_{name}")
