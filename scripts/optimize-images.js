const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '..', 'images');

// Config per folder
const FOLDER_CONFIG = {
  'hero':              { maxWidth: 1920, quality: 85 },
  'equipes-feminin':   { maxWidth: 1200, quality: 82 },
  'equipes-junior':    { maxWidth: 1200, quality: 82 },
  'equipes-masculin':  { maxWidth: 1200, quality: 82 },
  'equipes-pro':       { maxWidth: 1200, quality: 82 },
  'media':             { maxWidth: 1400, quality: 80 },
  'staff':             { maxWidth: 1200, quality: 85 },
  'galerie':           { maxWidth: 1200, quality: 82 },
};

const SKIP_FOLDERS = ['logo'];
const SKIP_THRESHOLD = 500 * 1024; // 500 KB
const VALID_EXT = ['.jpg', '.jpeg', '.png', '.heic', '.webp'];

async function optimizeFile(filePath, config) {
  const ext = path.extname(filePath).toLowerCase();
  if (!VALID_EXT.includes(ext)) return null;

  const stats = fs.statSync(filePath);
  const sizeBefore = stats.size;

  if (sizeBefore < SKIP_THRESHOLD) {
    return { name: path.basename(filePath), before: sizeBefore, after: sizeBefore, skipped: true };
  }

  try {
    // Read into buffer first to avoid Windows file locking issues
    const inputBuffer = fs.readFileSync(filePath);
    let pipeline = sharp(inputBuffer, { failOn: 'none' });
    const meta = await pipeline.metadata();

    if (config.square) {
      const side = Math.min(meta.width || 9999, meta.height || 9999, config.maxWidth);
      pipeline = pipeline.resize(side, side, { fit: 'cover', position: 'centre' });
    } else if (meta.width && meta.width > config.maxWidth) {
      pipeline = pipeline.resize(config.maxWidth, null, { withoutEnlargement: true });
    }

    const outputBuffer = await pipeline
      .jpeg({ quality: config.quality, progressive: true, mozjpeg: true })
      .toBuffer();

    // Only write if actually smaller
    if (outputBuffer.length < sizeBefore) {
      const outPath = filePath.replace(/\.(heic|png|webp)$/i, '.jpg');
      try {
        fs.writeFileSync(outPath, outputBuffer);
      } catch (writeErr) {
        // On EPERM, try unlinking first then writing
        if (writeErr.code === 'EPERM' || writeErr.code === 'EBUSY') {
          try {
            fs.unlinkSync(outPath);
          } catch (_) {}
          fs.writeFileSync(outPath, outputBuffer);
        } else {
          throw writeErr;
        }
      }
      // Remove original if extension changed
      if (outPath !== filePath) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
      return { name: path.basename(filePath), before: sizeBefore, after: outputBuffer.length };
    }

    return { name: path.basename(filePath), before: sizeBefore, after: sizeBefore, skipped: true };
  } catch (err) {
    console.error(`  ERROR: ${path.basename(filePath)} — ${err.message}`);
    return null;
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  const folders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const folder of folders) {
    if (SKIP_FOLDERS.includes(folder)) {
      console.log(`\n⏭  ${folder}/ — SKIPPED (logo)`);
      continue;
    }

    const config = FOLDER_CONFIG[folder] || { maxWidth: 1200, quality: 82 };
    const folderPath = path.join(IMAGES_DIR, folder);
    const files = fs.readdirSync(folderPath).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return VALID_EXT.includes(ext);
    });

    if (files.length === 0) continue;

    console.log(`\n📁 ${folder}/ (${files.length} images, max ${config.maxWidth}px, q${config.quality}${config.square ? ', crop square' : ''})`);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const result = await optimizeFile(filePath, config);
      if (!result) continue;

      totalBefore += result.before;
      totalAfter += result.after;

      if (result.skipped) {
        skipped++;
        console.log(`  ${result.name}: ${formatSize(result.before)} — skipped (< 500KB or no gain)`);
      } else {
        processed++;
        const gain = ((1 - result.after / result.before) * 100).toFixed(0);
        console.log(`  ${result.name}: ${formatSize(result.before)} → ${formatSize(result.after)} (${gain}% saved)`);
      }
    }
  }

  // Also handle root-level images
  const rootFiles = fs.readdirSync(IMAGES_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return VALID_EXT.includes(ext) && fs.statSync(path.join(IMAGES_DIR, f)).isFile();
  });

  if (rootFiles.length > 0) {
    console.log(`\n📁 images/ root (${rootFiles.length} images)`);
    const config = { maxWidth: 1200, quality: 82 };
    for (const file of rootFiles) {
      const filePath = path.join(IMAGES_DIR, file);
      const result = await optimizeFile(filePath, config);
      if (!result) continue;
      totalBefore += result.before;
      totalAfter += result.after;
      if (result.skipped) {
        skipped++;
      } else {
        processed++;
        const gain = ((1 - result.after / result.before) * 100).toFixed(0);
        console.log(`  ${result.name}: ${formatSize(result.before)} → ${formatSize(result.after)} (${gain}% saved)`);
      }
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log(`✅ DONE`);
  console.log(`   Processed: ${processed} files`);
  console.log(`   Skipped:   ${skipped} files`);
  console.log(`   Before:    ${formatSize(totalBefore)}`);
  console.log(`   After:     ${formatSize(totalAfter)}`);
  console.log(`   Saved:     ${formatSize(totalBefore - totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
  console.log('══════════════════════════════════════');
}

main().catch(console.error);
