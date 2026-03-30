#!/bin/bash

echo "=========================================="
echo "Jenkins React Build Process"
echo "=========================================="

# Check Node.js version
echo "Checking Node.js version..."
node --version
npm --version

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
fi

# Run tests
echo ""
echo "Running tests..."
npm test -- --coverage --watchAll=false

if [ $? -ne 0 ]; then
    echo "Tests failed"
    exit 1
fi

# Build the application
echo ""
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

# Check if build directory exists
if [ -d "build" ]; then
    echo ""
    echo "Build directory created successfully"
    ls -lh build/
else
    echo "Build directory not found"
    exit 1
fi

echo ""
echo "=========================================="
echo "Build Successful!"
echo "=========================================="
exit 0
