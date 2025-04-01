#!/bin/bash

# Script to run tests in batches to avoid memory issues

echo "Running tests in batches to avoid memory issues..."

# Run utils tests
echo "Running batch 1: Utils tests"
npm run test:batch1
if [ $? -ne 0 ]; then
  echo "Batch 1 failed"
  exit 1
fi

# Run hooks tests
echo "Running batch 2: Hooks tests"
npm run test:batch2
if [ $? -ne 0 ]; then
  echo "Batch 2 failed"
  exit 1
fi

# Run contexts tests
echo "Running batch 3: Contexts tests"
npm run test:batch3
if [ $? -ne 0 ]; then
  echo "Batch 3 failed"
  exit 1
fi

# Run components tests
echo "Running batch 4: Components tests"
npm run test:batch4
if [ $? -ne 0 ]; then
  echo "Batch 4 failed"
  exit 1
fi

# Run App tests
echo "Running batch 5: App tests"
npm run test:batch5
if [ $? -ne 0 ]; then
  echo "Batch 5 failed"
  exit 1
fi

echo "All tests passed!"
exit 0
