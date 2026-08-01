#!/usr/bin/env bash
# One-time setup. Run once inside the connect_kit folder.
set -e
cd "$(dirname "$0")"

echo "1/2  Installing brand fonts (Josefin Sans, Inter)…"
if [ "$(uname)" = "Darwin" ]; then
  mkdir -p ~/Library/Fonts
  cp assets/fonts/*.ttf ~/Library/Fonts/ 2>/dev/null || true
else
  mkdir -p ~/.fonts
  cp assets/fonts/*.ttf ~/.fonts/ 2>/dev/null || true
  fc-cache -f >/dev/null 2>&1 || true
fi

echo "2/2  Installing the docx library…"
[ -f package.json ] || npm init -y >/dev/null 2>&1
npm install docx >/dev/null 2>&1

echo "Done. Note: PDF conversion needs LibreOffice installed (the 'soffice' command)."
echo "  macOS:  brew install --cask libreoffice"
echo "  Ubuntu: sudo apt-get install libreoffice"
