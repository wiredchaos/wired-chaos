"""
Project File Scanner
Scans project directories and extracts content from source files
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Set

SUPPORTED_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.sol', '.md', '.txt',
    '.json', '.yaml', '.yml', '.html', '.css', '.scss'
}

IGNORED_DIRS = {
    'node_modules', '__pycache__', '.git', 'build', 'dist',
    'venv', 'env', '.vscode', '.idea', 'coverage'
}


def scan_project_files(root_dir: str, max_file_size: int = 1024 * 1024) -> Dict:
    """
    Scan project directory and extract file contents
    
    Args:
        root_dir: Root directory to scan
        max_file_size: Maximum file size to read (default 1MB)
    
    Returns:
        Dictionary with file paths and contents
    """
    files_data = {
        'scanned_at': None,
        'root_directory': root_dir,
        'files': [],
        'stats': {
            'total_files': 0,
            'total_size': 0,
            'by_extension': {}
        }
    }
    
    root_path = Path(root_dir).resolve()
    
    for file_path in root_path.rglob('*'):
        # Skip directories and ignored paths
        if file_path.is_dir():
            continue
        
        if any(ignored in file_path.parts for ignored in IGNORED_DIRS):
            continue
        
        # Check file extension
        if file_path.suffix not in SUPPORTED_EXTENSIONS:
            continue
        
        # Check file size
        try:
            file_size = file_path.stat().st_size
            if file_size > max_file_size:
                continue
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            relative_path = str(file_path.relative_to(root_path))
            
            files_data['files'].append({
                'path': relative_path,
                'extension': file_path.suffix,
                'size': file_size,
                'content': content
            })
            
            # Update stats
            files_data['stats']['total_files'] += 1
            files_data['stats']['total_size'] += file_size
            
            ext = file_path.suffix
            if ext not in files_data['stats']['by_extension']:
                files_data['stats']['by_extension'][ext] = 0
            files_data['stats']['by_extension'][ext] += 1
            
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            continue
    
    from datetime import datetime, timezone
    files_data['scanned_at'] = datetime.now(timezone.utc).isoformat()
    
    return files_data


def extract_text_content(files_data: Dict) -> str:
    """
    Extract concatenated text content from scanned files
    
    Args:
        files_data: Output from scan_project_files
    
    Returns:
        Concatenated text content
    """
    text_parts = []
    
    for file_info in files_data.get('files', []):
        text_parts.append(f"=== {file_info['path']} ===")
        text_parts.append(file_info['content'])
        text_parts.append("")
    
    return "\n".join(text_parts)
