#!/usr/bin/env bash
# Build a branded brief PDF from a content JSON.
# Usage: ./make.sh content_daily.json daily     (or content_weekly.json weekly)
set -e
cd "$(dirname "$0")"
CONTENT="${1:-content_daily.json}"
TYPE="${2:-daily}"

DOCX=$(node build.js "$CONTENT" "$TYPE")
soffice --headless --convert-to pdf --outdir "$(dirname "$DOCX")" "$DOCX" >/dev/null 2>&1
PDF="${DOCX%.docx}.pdf"
echo "$PDF"
