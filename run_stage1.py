"""Run this file in PyCharm. Launches the existing Next.js app on localhost:3000."""
from pathlib import Path
import os
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent

def main():
    node = os.environ.get("VIBECHECK_NODE") or shutil.which("node")
    # Workspace-local runtime prepared on this Mac; no global installation needed.
    if not node:
        candidates = sorted((ROOT.parent.parent / "work").glob("node-*-darwin-arm64/bin/node"))
        node = str(candidates[-1]) if candidates else None
    if not node or not Path(node).is_file():
        sys.exit("Node.js 22.12+ required. Install from https://nodejs.org/ or set VIBECHECK_NODE to its executable.")
    env = dict(os.environ)
    env["PATH"] = str(Path(node).parent) + os.pathsep + env.get("PATH", "")
    env["NEXT_TELEMETRY_DISABLED"] = "1"
    cli = ROOT / "node_modules/next/dist/bin/next"
    if not cli.exists():
        sys.exit("Dependencies missing. Run npm ci in this project first.")
    print("Stage 1: http://localhost:3000/learn\nStop: Ctrl+C", flush=True)
    mode = "start" if "--production" in sys.argv else "dev"
    try:
        subprocess.run([node, str(cli), mode, "--hostname", "127.0.0.1", "--port", "3000"], cwd=ROOT, env=env, check=True)
    except KeyboardInterrupt:
        pass
    except subprocess.CalledProcessError as error:
        sys.exit(error.returncode)

if __name__ == "__main__":
    main()
