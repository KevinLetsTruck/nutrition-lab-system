#!/usr/bin/env python3
"""
Git MCP Server Runner
"""
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the main function from server.py
from server import main

if __name__ == "__main__":
    main()




