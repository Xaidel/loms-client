#!/bin/bash

src="dist"
dest="build"

# Ensure destination exists
mkdir -p "$dest"

# Move bundle.js
if [ -f "$src/bundle.js" ]; then
  mv "$src/bundle.js" "$dest/"
  echo "Moved: bundle.js"
fi

# Move all .d.ts except index.d.ts (recursive, preserving structure)
find "$src" -type f -name "*.d.ts" ! -name "index.d.ts" -print0 | while IFS= read -r -d '' file; do
  rel_path="${file#$src/}"
  dest_path="$dest/$rel_path"

  mkdir -p "$(dirname "$dest_path")"
  mv "$file" "$dest_path"
  echo "Moved: $rel_path"
done
