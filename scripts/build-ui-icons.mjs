import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const sourcePath = path.resolve('source-assets/ui/point-click-icons-raw.png');
const outputDir = path.resolve('public/assets/ui/icons');
const iconSize = 64;
const iconNames = ['walk', 'look', 'use', 'talk', 'exit', 'map', 'inventory'];

const source = PNG.sync.read(fs.readFileSync(sourcePath));

const getPixelIndex = (image, x, y) => ((image.width * y) + x) << 2;

const isChromaGreen = (r, g, b) => g > 80 && g - r > 24 && g - b > 24;

const getPixel = (image, x, y) => {
    const index = getPixelIndex(image, x, y);
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    const a = isChromaGreen(r, g, b) ? 0 : 255;

    if (a > 0 && g - r > 18 && g - b > 18) {
        return { r, g: Math.max(r, b, Math.round(g * 0.5)), b, a };
    }

    return { r, g, b, a };
};

const setPixel = (image, x, y, pixel) => {
    const index = getPixelIndex(image, x, y);
    image.data[index] = pixel.r;
    image.data[index + 1] = pixel.g;
    image.data[index + 2] = pixel.b;
    image.data[index + 3] = pixel.a;
};

const findContentBounds = (crop) => {
    let minX = crop.width;
    let minY = crop.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < crop.height; y += 1) {
        for (let x = 0; x < crop.width; x += 1) {
            const pixel = getPixel(source, crop.x + x, crop.y + y);

            if (pixel.a > 0) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        throw new Error(`No icon content found in crop ${JSON.stringify(crop)}`);
    }

    return {
        x: crop.x + minX,
        y: crop.y + minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
};

const writeIcon = (name, slot) => {
    const slotWidth = source.width / iconNames.length;
    const cropX = Math.round(slot * slotWidth);
    const nextCropX = Math.round((slot + 1) * slotWidth);
    const crop = {
        x: cropX,
        y: 0,
        width: nextCropX - cropX,
        height: source.height
    };
    const contentBounds = findContentBounds(crop);
    const output = new PNG({ width: iconSize, height: iconSize, colorType: 6 });
    const scale = Math.min(
        (iconSize - 4) / contentBounds.width,
        (iconSize - 4) / contentBounds.height
    );
    const outputWidth = Math.max(1, Math.round(contentBounds.width * scale));
    const outputHeight = Math.max(1, Math.round(contentBounds.height * scale));
    const offsetX = Math.floor((iconSize - outputWidth) / 2);
    const offsetY = Math.floor((iconSize - outputHeight) / 2);

    for (let targetY = 0; targetY < outputHeight; targetY += 1) {
        for (let targetX = 0; targetX < outputWidth; targetX += 1) {
            const sourceX = contentBounds.x + Math.min(
                contentBounds.width - 1,
                Math.floor(targetX / scale)
            );
            const sourceY = contentBounds.y + Math.min(
                contentBounds.height - 1,
                Math.floor(targetY / scale)
            );
            const pixel = getPixel(source, sourceX, sourceY);

            if (pixel.a > 0) {
                setPixel(output, offsetX + targetX, offsetY + targetY, pixel);
            }
        }
    }

    const outputPath = path.join(outputDir, `${name}.png`);
    fs.writeFileSync(outputPath, PNG.sync.write(output));
    console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
};

fs.mkdirSync(outputDir, { recursive: true });
iconNames.forEach(writeIcon);
