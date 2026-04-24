"""Shared helpers for processing scripts."""
import json
import math
import re
import sys
import time
import os


def is_valid_email(email: str) -> bool:
    """Return True only if email passes basic format validation."""
    return bool(re.match(r'^\S+@\S+\.\S+$', str(email).strip()))


def _sanitize(obj):
    """Recursively make obj JSON-safe.

    Converts:
      • Python float NaN/Inf          → None
      • numpy floating NaN/Inf        → None (numpy.float64/32 may not be subclass of float)
      • numpy integer scalars         → int  (numpy.int64 is not json-serialisable)
      • numpy bool scalars            → bool
    Falls back to str() for anything else that would raise TypeError in json.dumps.
    """
    # numpy scalar handling (guard with try/except so numpy is optional)
    try:
        import numpy as np
        if isinstance(obj, np.floating):
            v = float(obj)
            return None if (math.isnan(v) or math.isinf(v)) else v
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, np.ndarray):
            return [_sanitize(x) for x in obj.tolist()]
    except ImportError:
        pass

    # Plain Python float
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None

    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]
    return obj


def read_payload():
    return json.loads(sys.stdin.read() or "{}")


def emit(payload):
    """Write payload as JSON to stdout (last line).

    Uses _sanitize to convert NaN/Inf and numpy scalars before serialising,
    so Node.js JSON.parse never sees invalid tokens like NaN.
    Falls back gracefully if serialisation still fails.
    """
    try:
        out = json.dumps(_sanitize(payload), allow_nan=False)
    except Exception as exc:  # noqa: BLE001
        # Should never happen after _sanitize, but emit a parseable error rather than crashing.
        out = json.dumps({'_error': f'emit serialisation failed: {exc}'})
    sys.stdout.write(out)
    sys.stdout.flush()


def out_path(output_dir, name):
    os.makedirs(output_dir, exist_ok=True)
    return os.path.join(output_dir, f"{int(time.time())}_{name}")
