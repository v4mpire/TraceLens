#!/usr/bin/env python3
"""
TraceLens Development Activity Logger

Automates the process of logging development activities to DEVLOG.md
following the systematic ledger format.

Usage:
    python3 scripts/log-dev-activity.py --type FEATURE --component "Dashboard UI" --description "Added new theme toggle" --impact HIGH --files "apps/web/src/components/ui/" --duration "30 minutes"
"""

import argparse
import datetime
import re
from pathlib import Path

def get_next_entry_number(devlog_path):
    """Extract the next entry number from DEVLOG.md"""
    try:
        with open(devlog_path, 'r') as f:
            content = f.read()
        
        # Find all entry numbers
        entry_pattern = r'### Entry #(\d+)'
        entries = re.findall(entry_pattern, content)
        
        if entries:
            return max(int(e) for e in entries) + 1
        else:
            return 1
    except FileNotFoundError:
        return 1

def update_ledger_summary(devlog_path, entry_type):
    """Update the ledger summary statistics"""
    try:
        with open(devlog_path, 'r') as f:
            content = f.read()
        
        # Update total entries
        total_pattern = r'\*\*Total Entries\*\* \| (\d+)'
        match = re.search(total_pattern, content)
        if match:
            current_total = int(match.group(1))
            new_total = current_total + 1
            content = re.sub(total_pattern, f'**Total Entries** | {new_total}', content)
        
        # Update specific type counts
        type_mapping = {
            'BUG_FIX': 'Bug Fixes',
            'FEATURE': 'Features Added',
            'UI_CHANGE': 'UI Changes',
            'PERFORMANCE': 'Performance Optimizations',
            'DOCUMENTATION': 'Documentation Updates'
        }
        
        if entry_type in type_mapping:
            type_name = type_mapping[entry_type]
            type_pattern = rf'\*\*{re.escape(type_name)}\*\* \| (\d+)'
            match = re.search(type_pattern, content)
            if match:
                current_count = int(match.group(1))
                new_count = current_count + 1
                content = re.sub(type_pattern, f'**{type_name}** | {new_count}', content)
        
        with open(devlog_path, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Warning: Could not update summary statistics: {e}")

def add_log_entry(devlog_path, entry_data):
    """Add a new log entry to DEVLOG.md"""
    try:
        with open(devlog_path, 'r') as f:
            content = f.read()
        
        # Find the insertion point (after "## Development Entries")
        insertion_pattern = r'(## Development Entries\n\n)'
        match = re.search(insertion_pattern, content)
        
        if not match:
            print("Error: Could not find insertion point in DEVLOG.md")
            return False
        
        # Create the new entry
        entry_text = f"""### Entry #{entry_data['number']:03d} - {entry_data['timestamp']}
**Type**: {entry_data['type']}  
**Component**: {entry_data['component']}  
**Description**: {entry_data['description']}  
**Impact**: {entry_data['impact']} - {entry_data.get('impact_description', 'Development activity')}  
**Files Changed**: {entry_data['files']}  
**Developer**: {entry_data.get('developer', 'AI Assistant')}  
**Duration**: {entry_data['duration']}  
{entry_data.get('additional_context', '')}

"""
        
        # Insert the new entry
        insertion_point = match.end()
        new_content = content[:insertion_point] + entry_text + content[insertion_point:]
        
        with open(devlog_path, 'w') as f:
            f.write(new_content)
        
        return True
        
    except Exception as e:
        print(f"Error adding log entry: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Log development activity to DEVLOG.md')
    parser.add_argument('--type', required=True, 
                       choices=['FEATURE', 'BUG_FIX', 'UI_CHANGE', 'PERFORMANCE', 'DOCUMENTATION', 'REFACTOR'],
                       help='Type of development activity')
    parser.add_argument('--component', required=True, help='Component affected')
    parser.add_argument('--description', required=True, help='Description of the change')
    parser.add_argument('--impact', required=True, 
                       choices=['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
                       help='Impact level of the change')
    parser.add_argument('--files', required=True, help='Files or directories changed')
    parser.add_argument('--duration', required=True, help='Time spent (e.g., "30 minutes", "2 hours")')
    parser.add_argument('--impact-description', help='Brief description of the impact')
    parser.add_argument('--developer', default='AI Assistant', help='Developer name')
    parser.add_argument('--additional-context', help='Additional context (performance, testing, etc.)')
    
    args = parser.parse_args()
    
    # Find DEVLOG.md
    devlog_path = Path('DEVLOG.md')
    if not devlog_path.exists():
        print("Error: DEVLOG.md not found in current directory")
        return 1
    
    # Get next entry number
    entry_number = get_next_entry_number(devlog_path)
    
    # Create timestamp
    timestamp = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
    
    # Prepare entry data
    entry_data = {
        'number': entry_number,
        'timestamp': timestamp,
        'type': args.type,
        'component': args.component,
        'description': args.description,
        'impact': args.impact,
        'impact_description': args.impact_description,
        'files': args.files,
        'developer': args.developer,
        'duration': args.duration,
        'additional_context': args.additional_context
    }
    
    # Add the log entry
    if add_log_entry(devlog_path, entry_data):
        print(f"✅ Added entry #{entry_number:03d} to DEVLOG.md")
        
        # Update summary statistics
        update_ledger_summary(devlog_path, args.type)
        print("✅ Updated ledger summary statistics")
        
        return 0
    else:
        print("❌ Failed to add log entry")
        return 1

if __name__ == '__main__':
    exit(main())