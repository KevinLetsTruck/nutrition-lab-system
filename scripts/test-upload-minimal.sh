#!/bin/bash

echo "Testing minimal upload API..."

# Test GET endpoint first
echo "Testing GET endpoint..."
curl -X GET http://localhost:3000/api/test-upload

echo -e "\n\nTesting POST endpoint with file..."

# Create a simple test file
echo "This is a test file" > test.txt

# Test upload
curl -X POST http://localhost:3000/api/test-upload \
  -F "file=@test.txt" \
  -H "Content-Type: multipart/form-data"

echo -e "\n\nCleaning up..."
rm -f test.txt

echo "Test completed!" 