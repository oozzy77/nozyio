#!/bin/bash

# build nozyio ui

cd nozyio/web && npm run build

cd ../..

# Clear the dist folder
rm -rf dist/*

# Run the build command
python3 -m build

twine upload dist/*