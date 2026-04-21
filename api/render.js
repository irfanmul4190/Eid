const sharp = require('sharp');
const path = require('path');

export default async function handler(req, res) {
    // Only allow POST requests now because we are sending logo data
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed - Use POST');
    }

    const { name, subText, logoData } = req.body;
    
    // Ensure the path matches your asset filename exactly (EidCard.jpg)
    const imagePath = path.resolve(process.cwd(), 'public', 'assets', 'EidCard.jpg');

    // 1. Create the Text Overlay (SVG)
    // Style: Bold, No Italics, All-Caps for the subtext
    const svgOverlay = Buffer.from(`
        <svg width="1748" height="2480">
            <style>
                .name { fill: black; font-size: 90px; font-family: sans-serif; font-weight: bold; }
                .sub { fill: #333333; font-size: 55px; font-family: sans-serif; font-weight: normal; text-transform: uppercase; }
            </style>
            <text x="50%" y="75%" text-anchor="middle" class="name">${name || ''}</text>
            <text x="50%" y="82%" text-anchor="middle" class="sub">${subText || ''}</text>
        </svg>`);

    try {
        let layers = [
            { input: svgOverlay, top: 0, left: 0 }
        ];

        // 2. Handle Logo Upload if provided
        if (logoData) {
            // Remove the data:image/png;base64, prefix
            const base64Data = logoData.replace(/^data:image\/\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            
            // Resize the uploaded logo so it fits nicely
            const resizedLogo = await sharp(logoBuffer)
                .resize({ width: 450, height: 450, fit: 'inside' })
                .toBuffer();

            layers.push({
                input: resizedLogo,
                top: 1300, // Adjust this number to move logo UP or DOWN
                left: 649  // (1748 - 450) / 2 = centered
            });
        }

        const finalImage = await sharp(imagePath)
            .composite(layers)
            .png()
            .toBuffer();

        // 3. Send the final image
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="Summit_Card.png"`);
        res.send(finalImage);

    } catch (err) {
        console.error('Sharp Processing Error:', err);
        res.status(500).send("Error generating card: " + err.message);
    }
}
