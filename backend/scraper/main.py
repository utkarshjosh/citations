#!/usr/bin/env python3
"""
Main entry point for the arXiv scraper
Runs the complete paper pipeline: fetch -> process -> store
"""

import sys
from pathlib import Path

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from run_pipeline import run_complete_pipeline

def main():
    """Run the complete paper pipeline"""
    # Run the complete pipeline
    result = run_complete_pipeline()
    
    if result.get("errors"):
        print(f"Pipeline failed with {len(result['errors'])} errors")
        for error in result["errors"]:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("Pipeline completed successfully")
        sys.exit(0)

if __name__ == "__main__":
    main()
