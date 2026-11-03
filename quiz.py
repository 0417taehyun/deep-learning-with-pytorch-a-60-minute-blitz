#!/usr/bin/env python3
"""Open the PyTorch 60-Minute Blitz quizzes in your default web browser.

Usage (from the repository root):
    python3 quiz.py          # quiz home (main.html): chapter quizzes + mixed practice
    python3 quiz.py 2        # chapter 2's quiz directly
    python3 quiz.py all      # every chapter quiz, each in its own tab
    python3 quiz.py --print  # only print the URLs, don't open a browser
"""
from __future__ import annotations

import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CHAPTERS = sorted(
    (p.parent.name for p in ROOT.glob("*/quiz.html")),
    key=lambda d: (not d.isdigit(), d.zfill(4)),
)


def targets(arg: str) -> list[Path]:
    if arg in ("", "home", "main"):
        return [ROOT / "main.html"]
    if arg == "all":
        return [ROOT / d / "quiz.html" for d in CHAPTERS]
    if arg in CHAPTERS:
        return [ROOT / arg / "quiz.html"]
    raise ValueError(arg)


def main(argv: list[str]) -> int:
    if "-h" in argv or "--help" in argv:
        print(__doc__.strip())
        return 0
    print_only = "--print" in argv
    args = [a for a in argv if a != "--print"]
    arg = args[0] if args else ""
    try:
        paths = targets(arg)
    except ValueError:
        print(f"Unknown quiz {arg!r}. Choose one of: home, all, {', '.join(CHAPTERS)}", file=sys.stderr)
        return 2

    for i, path in enumerate(paths):
        if not path.exists():
            print(f"Missing file: {path}", file=sys.stderr)
            return 1
        url = path.as_uri()
        print(url)
        if not print_only:
            (webbrowser.open if i == 0 else webbrowser.open_new_tab)(url)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
