const sharp = require('sharp');
const path = require('path');

export default async function handler(req, res) {
    const { name } = req.query;
    
    // 1. Path to your static A5 design
    const imagePath = path.resolve(process.cwd(), 'public', 'assets', 'EidCard.png');

    // 2. Define the text overlay as an SVG (Best for high-quality printing)
    // A5 at 300 DPI is roughly 1748 x 2480 pixels
    const svgOverlay = `
        <svg width="1748" height="2480">
            <style>
                .name { fill: black; font-size: 80px; font-family: serif; font-style: italic; }
            </style>
            <text x="50%" y="95%" text-anchor="middle" class="name">${name || ''}</text>
        </svg>`;

    try {
        const image = await sharp(imagePath)
            .composite([{
                input: Buffer.from(svgOverlay),
                top: 0,
                left: 0
            }])
            .png() // Keep it high quality
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="Eid_Card.png"');
        res.send(image);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating card");
    }
}
