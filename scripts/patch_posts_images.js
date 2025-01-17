
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function patchMdImages(mdFile, imagesDir, destImagesDir) {
    console.log(`Patching ${mdFile} ...`);
    let lines = fs.readFileSync(mdFile, 'utf-8').split('\n');
    let firstDone = false;
    lines = lines.map(line => {
        let stripLine = line.trim();
        if (stripLine.startsWith('![')) {
            let index = stripLine.indexOf('(');
            if (index === -1) return line;
            let filename = stripLine.substring(index + 1, stripLine.indexOf(')', index)).split(' ')[0];
            if (!filename.startsWith('/images')) return line;
            let filepath = filename;
            let dFilepath = filepath.includes('/d/') && filepath.endsWith('.webp') ? filepath : filepath.replace('/images', '/images/d').replace(/_/g, '-').toLowerCase().replace(/\.\w+$/, '.webp');
            let dFilepathFull = path.join(destImagesDir, dFilepath.substring(1));
            if (!fs.existsSync(dFilepathFull)) {
                fs.mkdirSync(path.dirname(dFilepathFull), { recursive: true });
                let input = path.join(imagesDir, filepath.substring(1));
                transform(input, dFilepathFull);
                console.log(`Converted ${input} to ${dFilepathFull}`);
            }
            let dThumbFilepath = dFilepathFull.replace('.webp', '-thumb.webp');
            if (!firstDone && !fs.existsSync(dThumbFilepath)) {
                transform(dFilepathFull, dThumbFilepath, { maxWidth: 640 });
                console.log(`Converted ${dFilepathFull} to ${dThumbFilepath}`);
                firstDone = true;
            }
            return line.replace(filepath, dFilepath);
        }
        return line;
    });
    fs.writeFileSync(mdFile, lines.join('\n'));
}

function main() {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const thisDir = __dirname;
    const parentDir = path.dirname(thisDir);
    const postsDir = path.join(parentDir, 'src', 'pages', 'posts');
    const imagesDir = parentDir;
    const destImagesDir = path.join(parentDir, 'public');
    fs.readdirSync(postsDir, { withFileTypes: true }).forEach(dirent => {
        if (dirent.isFile() && dirent.name.endsWith('.md')) {
            patchMdImages(path.join(postsDir, dirent.name), imagesDir, destImagesDir);
        }
    });
}

main();