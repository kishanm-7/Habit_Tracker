const sharp = require('sharp');
const path = require('path');

const sizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 }
];

const promises = [];

sizes.forEach(({ folder, size }) => {
  const p1 = sharp('public/forge-logo.png')
    .resize(size, size)
    .toFile(`android/app/src/main/res/${folder}/ic_launcher.png`)
    .then(() => console.log(`✓ ${folder}/ic_launcher.png (${size}x${size})`));

  const p2 = sharp('public/forge-logo.png')
    .resize(size, size)
    .toFile(`android/app/src/main/res/${folder}/ic_launcher_round.png`)
    .then(() => console.log(`✓ ${folder}/ic_launcher_round.png (${size}x${size})`));

  promises.push(p1, p2);
});

Promise.all(promises)
  .then(() => console.log('\nAll icons generated successfully!'))
  .catch(err => console.error('Error:', err));
