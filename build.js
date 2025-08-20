const fs = require('fs');
const path = require('path');

const src = 'dist';
const dest = 'build';

// Ensure destination exists
if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
}

// Move bundle.js
const bundlePath = path.join(src, 'bundle.js');
if (fs.existsSync(bundlePath)) {
    fs.renameSync(bundlePath, path.join(dest, 'bundle.js'));
    console.log('Moved: bundle.js');
}

// Function to recursively move .d.ts files except index.d.ts
function moveTypeFiles(srcDir, destDir, baseSrc = src) {
    if (!fs.existsSync(srcDir)) {
        return;
    }

    const items = fs.readdirSync(srcDir);

    items.forEach(item => {
        const srcPath = path.join(srcDir, item);
        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
            // Recursively process subdirectories
            moveTypeFiles(srcPath, destDir, baseSrc);
        } else if (item.endsWith('.d.ts') && item !== 'index.d.ts') {
            // Calculate relative path from base src directory
            const relPath = path.relative(baseSrc, srcPath);
            const destPath = path.join(destDir, relPath);
            const destDirPath = path.dirname(destPath);

            // Create destination directory if it doesn't exist
            if (!fs.existsSync(destDirPath)) {
                fs.mkdirSync(destDirPath, { recursive: true });
            }

            // Move the file
            fs.renameSync(srcPath, destPath);
            console.log(`Moved: ${relPath}`);
        }
    });
}

// Start moving type files
if (fs.existsSync(src)) {
    moveTypeFiles(src, dest);
} else {
    console.log(`Source directory '${src}' does not exist`);
}