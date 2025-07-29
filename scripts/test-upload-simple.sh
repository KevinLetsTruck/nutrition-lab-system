#!/bin/bash

echo "Testing upload API..."

# Test GET endpoint first
echo "Testing GET endpoint..."
curl -X GET http://localhost:3000/api/upload

echo -e "\n\nTesting POST endpoint with file..."

# Create a simple test file
echo "This is a test file" > test.txt

# Test upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.txt" \
  -F "clientEmail=test@example.com" \
  -F "clientFirstName=Test" \
  -F "clientLastName=User" \
  -H "Content-Type: multipart/form-data"

echo -e "\n\nCleaning up..."
rm -f test.txt

echo "Test completed!" 