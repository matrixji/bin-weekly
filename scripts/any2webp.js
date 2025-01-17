
import sharp from 'sharp';

async function transform(input, output, maxWidth = 1920) {
    let image = sharp(input);

    // Get metadata to check width and extract exif
    const metadata = await image.metadata();
    const exif = metadata.exif;

    // Resize if needed
    if (metadata.width > maxWidth) {
        image = image.resize(maxWidth);
    }

    if (!output) {
        output = input.slice(0, input.lastIndexOf('.')) + '.webp';
    }

    // Save image as webp with exif
    await image.webp({ quality: 90 }).withMetadata({ exif }).toFile(output);
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: node any2webp.js <input> [output]');
        process.exit(1);
    }

    const input = args[0];
    const output = args.length > 1 ? args[1] : '';

    await transform(input, output);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});