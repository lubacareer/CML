import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const existingSourcePath = path.resolve('Hazel2.png');
const generatedSourcePath = path.resolve('source-assets/characters/hazel-direction-raw.png');
const outputPath = path.resolve('public/assets/characters/hazel-4dir.png');
const metadataPath = path.resolve('public/assets/characters/hazel-4dir.json');

const frameWidth = 192;
const frameHeight = 360;
const columns = 11;
const rows = 4;
const targetContentHeight = 330;
const targetContentWidth = 176;

const existingFrames = {
    sideIdleLeft: { x: 693, y: 39, width: 94, height: 370 },
    walkRight01: { x: 38, y: 432, width: 168, height: 281 },
    walkRight02: { x: 229, y: 433, width: 115, height: 281 },
    walkRight03: { x: 388, y: 432, width: 124, height: 282 },
    walkRight04: { x: 542, y: 436, width: 161, height: 278 },
    walkRight05: { x: 730, y: 436, width: 158, height: 278 },
    walkRight06: { x: 904, y: 434, width: 138, height: 277 },
    walkRight07: { x: 1089, y: 432, width: 143, height: 283 },
    walkRight08: { x: 1270, y: 434, width: 133, height: 280 },
    frontIdle01: { x: 100, y: 740, width: 107, height: 326 },
    frontIdle02: { x: 243, y: 742, width: 102, height: 324 },
    think01: { x: 440, y: 753, width: 110, height: 242 },
    think02: { x: 581, y: 755, width: 113, height: 241 },
    surprised01: { x: 741, y: 762, width: 135, height: 233 },
    surprised02: { x: 887, y: 754, width: 121, height: 239 },
    talk01: { x: 1068, y: 753, width: 124, height: 242 },
    talk02: { x: 1211, y: 751, width: 157, height: 245 }
};

const frameNames = [
    'idleRight',
    ...Array.from({ length: 8 }, (_, index) => `walkRight${index + 1}`),
    'idleLeft',
    ...Array.from({ length: 8 }, (_, index) => `walkLeft${index + 1}`),
    'idleDown1',
    'idleDown2',
    ...Array.from({ length: 8 }, (_, index) => `walkDown${index + 1}`),
    'idleUp1',
    'idleUp2',
    ...Array.from({ length: 8 }, (_, index) => `walkUp${index + 1}`),
    'think1',
    'think2',
    'surprised1',
    'surprised2',
    'talk1',
    'talk2'
];

const frameIndexByName = Object.fromEntries(frameNames.map((name, index) => [name, index]));

const existingSource = PNG.sync.read(fs.readFileSync(existingSourcePath));
const generatedSource = PNG.sync.read(fs.readFileSync(generatedSourcePath));
const sheet = new PNG({
    width: frameWidth * columns,
    height: frameHeight * rows,
    colorType: 6
});

const getPixelIndex = (image, x, y) => ((image.width * y) + x) << 2;

const isChromaGreen = (r, g, b) => g > 80 && g - r > 24 && g - b > 24;

const getPixel = (image, x, y, chromaKey = false) => {
    const index = getPixelIndex(image, x, y);
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    let a = image.colorType === 6 ? image.data[index + 3] : 255;

    if (chromaKey && isChromaGreen(r, g, b)) {
        a = 0;
    }

    if (chromaKey && a > 0 && g - r > 18 && g - b > 18) {
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

const findContentBounds = (source, crop, chromaKey) => {
    let minX = crop.width;
    let minY = crop.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < crop.height; y += 1) {
        for (let x = 0; x < crop.width; x += 1) {
            const pixel = getPixel(source, crop.x + x, crop.y + y, chromaKey);

            if (pixel.a > 24) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        throw new Error(`No visible content found in crop ${JSON.stringify(crop)}`);
    }

    return {
        x: crop.x + minX,
        y: crop.y + minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
};

const placeFrame = ({
    source,
    crop,
    frameIndex,
    chromaKey = false,
    flipX = false,
    contentWidth = targetContentWidth,
    contentHeight = targetContentHeight
}) => {
    const contentBounds = findContentBounds(source, crop, chromaKey);
    const scale = Math.min(
        contentWidth / contentBounds.width,
        contentHeight / contentBounds.height
    );
    const outputWidth = Math.max(1, Math.round(contentBounds.width * scale));
    const outputHeight = Math.max(1, Math.round(contentBounds.height * scale));
    const frameColumn = frameIndex % columns;
    const frameRow = Math.floor(frameIndex / columns);
    const baseX = frameColumn * frameWidth;
    const baseY = frameRow * frameHeight;
    const offsetX = baseX + Math.floor((frameWidth - outputWidth) / 2);
    const offsetY = baseY + frameHeight - outputHeight;

    for (let targetY = 0; targetY < outputHeight; targetY += 1) {
        for (let targetX = 0; targetX < outputWidth; targetX += 1) {
            const unflippedX = Math.min(
                contentBounds.width - 1,
                Math.floor(targetX / scale)
            );
            const sourceX = contentBounds.x + (flipX ? contentBounds.width - 1 - unflippedX : unflippedX);
            const sourceY = contentBounds.y + Math.min(
                contentBounds.height - 1,
                Math.floor(targetY / scale)
            );
            const pixel = getPixel(source, sourceX, sourceY, chromaKey);

            if (pixel.a > 0) {
                setPixel(sheet, offsetX + targetX, offsetY + targetY, pixel);
            }
        }
    }
};

const generatedSlotCrop = (row, slot) => {
    const slotWidth = generatedSource.width / 10;
    const slotHeight = generatedSource.height / 2;
    const x = Math.round(slot * slotWidth);
    const y = Math.round(row * slotHeight);
    const nextX = Math.round((slot + 1) * slotWidth);
    const nextY = Math.round((row + 1) * slotHeight);

    return {
        x,
        y,
        width: nextX - x,
        height: nextY - y
    };
};

placeFrame({
    source: existingSource,
    crop: existingFrames.sideIdleLeft,
    frameIndex: frameIndexByName.idleRight,
    flipX: true
});

Array.from({ length: 8 }, (_, index) => {
    const crop = existingFrames[`walkRight0${index + 1}`];

    placeFrame({
        source: existingSource,
        crop,
        frameIndex: frameIndexByName[`walkRight${index + 1}`]
    });
    placeFrame({
        source: existingSource,
        crop,
        frameIndex: frameIndexByName[`walkLeft${index + 1}`],
        flipX: true
    });
});

placeFrame({
    source: existingSource,
    crop: existingFrames.sideIdleLeft,
    frameIndex: frameIndexByName.idleLeft
});

placeFrame({
    source: existingSource,
    crop: existingFrames.frontIdle01,
    frameIndex: frameIndexByName.idleDown1
});
placeFrame({
    source: existingSource,
    crop: existingFrames.frontIdle02,
    frameIndex: frameIndexByName.idleDown2
});

Array.from({ length: 8 }, (_, index) => {
    placeFrame({
        source: generatedSource,
        crop: generatedSlotCrop(0, index + 2),
        frameIndex: frameIndexByName[`walkDown${index + 1}`],
        chromaKey: true
    });
    placeFrame({
        source: generatedSource,
        crop: generatedSlotCrop(1, index + 2),
        frameIndex: frameIndexByName[`walkUp${index + 1}`],
        chromaKey: true
    });
});

placeFrame({
    source: generatedSource,
    crop: generatedSlotCrop(1, 0),
    frameIndex: frameIndexByName.idleUp1,
    chromaKey: true
});
placeFrame({
    source: generatedSource,
    crop: generatedSlotCrop(1, 1),
    frameIndex: frameIndexByName.idleUp2,
    chromaKey: true
});

[
    ['think1', 'think01'],
    ['think2', 'think02'],
    ['surprised1', 'surprised01'],
    ['surprised2', 'surprised02'],
    ['talk1', 'talk01'],
    ['talk2', 'talk02']
].forEach(([targetName, sourceName]) => {
    placeFrame({
        source: existingSource,
        crop: existingFrames[sourceName],
        frameIndex: frameIndexByName[targetName]
    });
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, PNG.sync.write(sheet));

const metadata = {
    sources: ['Hazel2.png', 'source-assets/characters/hazel-direction-raw.png'],
    image: 'assets/characters/hazel-4dir.png',
    frameWidth,
    frameHeight,
    columns,
    rows,
    frameCount: frameNames.length,
    displayScale: 0.64,
    frames: frameIndexByName,
    animations: {
        idleRight: [0],
        walkRight: [1, 2, 3, 4, 5, 6, 7, 8],
        idleLeft: [9],
        walkLeft: [10, 11, 12, 13, 14, 15, 16, 17],
        idleDown: [18, 19],
        walkDown: [20, 21, 22, 23, 24, 25, 26, 27],
        idleUp: [28, 29],
        walkUp: [30, 31, 32, 33, 34, 35, 36, 37],
        think: [38, 39],
        surprised: [40, 41],
        talk: [42, 43]
    }
};

fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} (${frameNames.length} frames)`);
console.log(`Wrote ${path.relative(process.cwd(), metadataPath)}`);
