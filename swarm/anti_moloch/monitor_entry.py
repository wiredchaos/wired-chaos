import json
import time
from pathlib import Path

from .monitor import AntiMolochMonitor


def main() -> None:
    monitor = AntiMolochMonitor()
    state = monitor.evaluate_state()
    outdir = Path("artifacts")
    outdir.mkdir(parents=True, exist_ok=True)
    fp = outdir / f"anti_moloch_{int(time.time())}.json"
    fp.write_text(json.dumps(state, indent=2))
    print("[Anti-Moloch] Summary:", json.dumps(state))


if __name__ == "__main__":
    main()
