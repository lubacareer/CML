import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const sourcePath = path.resolve('Hazel2.png');
const outputPath = path.resolve('public/assets/characters/hazel-normalized.png');
const metadataPath = path.resolve('public/assets/characters/hazel-normalized.json');

const frameWidth = 192;
const frameHeight = 360;
const targetContentHeight = 330;
const targetContentWidth = 176;

const frames = [
    { key: 'sideIdleRight', x: 693, y: 39, width: 94, height: 370 },
    { key: 'walk01', x: 38, y: 432, width: 168, height: 281 },
    { key: 'walk02', x: 229, y: 433, width: 115, height: 281 },
    { key: 'walk03', x: 388, y: 432, width: 124, height: 282 },
    { key: 'walk04', x: 542, y: 436, width: 161, height: 278 },
    { key: 'walk05', x: 730, y: 436, width: 158, height: 278 },
    { key: 'walk06', x: 904, y: 434, width: 138, height: 277 },
    { key: 'walk07', x: 1089, y: 432, width: 143, height: 283 },
    { key: 'walk08', x: 1270, y: 434, width: 133, height: 280 },
    { key: 'frontIdle01', x: 100, y: 740, width: 107, height: 326 },
    { key: 'frontIdle02', x: 243, y: 742, width: 102, height: 324 },
    { key: 'think01', x: 440, y: 753, width: 110, height: 242 },
    { key: 'think02', x: 581, y: 755, width: 113, height: 241 },
    { key: 'surprised01', x: 741, y: 762, width: 135, height: 233 },
    { key: 'surprised02', x: 887, y: 754, width: 121, height: 239 },
    { key: 'talk01', x: 1068, y: 753, width: 124, height: 242 },
    { key: 'talk02', x: 1211, y: 751, width: 157, height: 245 }
];

const source = PNG.sync.read(fs.readFileSync(sourcePath));
const sheet = new PNG({
    width: frameWidth * frames.length,
    height: frameHeight,
    colorType: 6
});

const getPixelIndex = (image, x, y) => ((image.width * y) + x) << 2;

const copyPixelNearest = (sourceImage, targetImage, sourceX, sourceY, targetX, targetY) => {
    const sourceIndex = getPixelIndex(sourceImage, sourceX, sourceY);
    const targetIndex = getPixelIndex(targetImage, targetX, targetY);

    targetImage.data[targetIndex] = sourceImage.data[sourceIndex];
    targetImage.data[targetIndex + 1] = sourceImage.data[sourceIndex + 1];
    targetImage.data[targetIndex + 2] = sourceImage.data[sourceIndex + 2];
    targetImage.data[targetIndex + 3] = sourceImage.data[sourceIndex + 3];
};

frames.forEach((frame, frameIndex) => {
    const scale = Math.min(
        targetContentWidth / frame.width,
        targetContentHeight / frame.height
    );
    const outputWidth = Math.max(1, Math.round(frame.width * scale));
    const outputHeight = Math.max(1, Math.round(frame.height * scale));
    const offsetX = (frameIndex * frameWidth) + Math.floor((frameWidth - outputWidth) / 2);
    const offsetY = frameHeight - outputHeight;

    for (let targetY = 0; targetY < outputHeight; targetY += 1) {
        for (let targetX = 0; targetX < outputWidth; targetX += 1) {
            const sourceX = frame.x + Math.min(
                frame.width - 1,
                Math.floor(targetX / scale)
            );
            const sourceY = frame.y + Math.min(
                frame.height - 1,
                Math.floor(targetY / scale)
            );

            copyPixelNearest(
                source,
                sheet,
                sourceX,
                sourceY,
                offsetX + targetX,
                offsetY + targetY
            );
        }
    }
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, PNG.sync.write(sheet));

const metadata = {
    source: 'Hazel2.png',
    image: 'assets/characters/hazel-normalized.png',
    frameWidth,
    frameHeight,
    frameCount: frames.length,
    displayScale: 0.5,
    frames: Object.fromEntries(frames.map((frame, index) => [frame.key, index])),
    animations: {
        idleSide: [0],
        walk: [1, 2, 3, 4, 5, 6, 7, 8],
        idleFront: [9, 10],
        think: [11, 12],
        surprised: [13, 14],
        talk: [15, 16]
    }
};

fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} (${frames.length} frames)`);
console.log(`Wrote ${path.relative(process.cwd(), metadataPath)}`);
