#!/usr/bin/env python3
import os, sys
from pathlib import Path

print("=" * 70)
print("🚀 WIRED CHAOS - Quick System Validation")
print("=" * 70)

# Check key files
files_to_check = [
    "frontend/src/components/TaxSuite.js",
    "frontend/src/App.js", 
    "worker/index.js",
    "worker/wrangler.toml",
    "backend/server.py"
]

passed = 0
total = len(files_to_check)

for file_path in files_to_check:
    if Path(file_path).exists():
        print(f"✅ {file_path}: EXISTS")
        passed += 1
    else:
        print(f"❌ {file_path}: MISSING")

print("=" * 70)
print(f"📊 VALIDATION RESULTS: {passed}/{total} files found")

if passed == total:
    print("🎉 ALL KEY FILES PRESENT - System Ready!")
elif passed > total // 2:
    print("⚠️  Most files present - Mostly ready")
else:
    print("❌ Critical files missing")
    
print("=" * 70)
