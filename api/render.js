const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

export default async function handler(req, res) {
    // Ensure we handle the POST request from your script.js
    if (req.method !== 'POST') return res.status(405).send('Use POST');

    const { name, logoData } = req.body;
    
    // Absolute path to the image in the public/assets folder
    const imagePath = path.join(process.cwd(), 'public', 'assets', 'EidCard.png');

    // 1. Safety Check: If the file doesn't exist, we send a clear error message
    if (!fs.existsSync(imagePath)) {
        return res.status(404).send(`Background image not found at: ${imagePath}`);
    }

    // 2. Prepare the Name Overlay (Bold, Non-Italic)
    const svgOverlay = Buffer.from(`
        <svg width="1748" height="2480">
            <style>
                .name { fill: black; font-size: 100px; font-family: sans-serif; font-weight: bold; }
            </style>
            <text x="50%" y="85%" text-anchor="middle" class="name">${name || ''}</text>
        </svg>`);

    try {
        let layers = [{ input: svgOverlay, top: 0, left: 0 }];

        // 3. Only add the logo layer if logoData actually exists
        if (logoData && logoData.includes('base64')) {
            const base64Data = logoData.replace(/^data:image\/\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            const resizedLogo = await sharp(logoBuffer)
                .resize(450, 450, { fit: 'inside' })
                .toBuffer();
            
            layers.push({ input: resizedLogo, top: 1300, left: 649 });
        }

        // 4. Bake the image
        const finalImage = await sharp(imagePath)
            .composite(layers)
            .png()
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="Summit_Card.png"');
        res.send(finalImage);

    } catch (err) {
        console.error('Sharp Error:', err);
        res.status(500).send("Baking failed: " + err.message);
    }
}
