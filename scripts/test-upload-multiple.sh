#!/bin/bash

echo "Testing multiple file upload..."

# Create test files
echo "This is test file 1" > test1.txt
echo "This is test file 2" > test2.txt

# Test upload with multiple files
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test1.txt" \
  -F "file=@test2.txt" \
  -F "clientEmail=test@example.com" \
  -F "clientFirstName=Test" \
  -F "clientLastName=User" \
  -H "Content-Type: multipart/form-data"

echo -e "\n\nCleaning up..."
rm -f test1.txt test2.txt

echo "Test completed!" 