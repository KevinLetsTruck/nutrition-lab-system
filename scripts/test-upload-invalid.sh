#!/bin/bash

echo "Testing upload API with invalid file..."

# Create an invalid file type
echo "This is a test file" > test.doc

# Test upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.doc" \
  -F "clientEmail=test@example.com" \
  -F "clientFirstName=Test" \
  -F "clientLastName=User" \
  -H "Content-Type: multipart/form-data"

echo -e "\n\nCleaning up..."
rm -f test.doc

echo "Test completed!" 