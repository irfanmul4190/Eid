const sharp = require('sharp');
const path = require('path');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Use POST');

    const { name, logoData } = req.body;
    const imagePath = path.resolve(process.cwd(), 'public', 'assets', 'EidCard.jpg');

    const svgOverlay = Buffer.from(`
        <svg width="1748" height="2480">
            <style>.name { fill: black; font-size: 90px; font-family: sans-serif; font-weight: bold; }</style>
            <text x="50%" y="85%" text-anchor="middle" class="name">${name || ''}</text>
        </svg>`);

    try {
        let layers = [{ input: svgOverlay, top: 0, left: 0 }];

        if (logoData) {
            const base64Data = logoData.replace(/^data:image\/\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            const resizedLogo = await sharp(logoBuffer).resize(450, 450, { fit: 'inside' }).toBuffer();
            layers.push({ input: resizedLogo, top: 1300, left: 649 });
        }

        const finalImage = await sharp(imagePath).composite(layers).png().toBuffer();
        res.setHeader('Content-Type', 'image/png');
        res.send(finalImage);
    } catch (err) {
        res.status(500).send(err.message);
    }
}
