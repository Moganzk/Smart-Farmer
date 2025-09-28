const sharp = require('sharp');

// Create a 1280x720 test image
sharp({
  create: {
    width: 1280,
    height: 720,
    channels: 3,
    background: { r: 255, g: 255, b: 255 }
  }
})
.jpeg()
.toFile('test-image.jpg')
.then(() => {
  console.log('Created test-image.jpg');
})
.catch(err => {
  console.error('Error:', err);
});

// Create a large test image (>5MB)
sharp({
  create: {
    width: 4096,
    height: 2160,
    channels: 3,
    background: { r: 255, g: 255, b: 255 }
  }
})
.jpeg({
  quality: 100,
  chromaSubsampling: '4:4:4' // Use full color information
})
.toFile('large-image.jpg')
.then(() => {
  console.log('Created large-image.jpg');
})
.catch(err => {
  console.error('Error:', err);
});