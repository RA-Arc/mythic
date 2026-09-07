const Jimp = require('jimp');
const fs = require('fs');

async function removeBlackBackground(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    // Make sure we have alpha channel
    image.rgba(true);
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const hex = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(hex);
        // If close to black, make transparent
        if (rgba.r < 30 && rgba.g < 30 && rgba.b < 30) {
          image.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
        }
      }
    }
    
    // Auto-crop the image to trim transparent space
    image.autocrop();
    
    await image.writeAsync(outputPath);
    console.log(`Processed ${inputPath} to ${outputPath}`);
  } catch (err) {
    console.error(err);
  }
}

removeBlackBackground(process.argv[2], process.argv[3]);
