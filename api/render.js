const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs'); // Added to handle temporary files
ffmpeg.setFfmpegPath(ffmpegPath);

export default async function handler(req, res) {
    const { name } = req.query;
    const videoPath = path.resolve(process.cwd(), 'public', 'assets', 'Eid.mp4');
    const fontPath = path.resolve(process.cwd(), 'public', 'assets', 'font.ttf');
    
    // Vercel allows writing to the /tmp folder
    const outputPath = path.join('/tmp', `Enfactum_${Date.now()}.mp4`);

    ffmpeg(videoPath)
        .videoFilters({
            filter: 'drawtext',
            options: {
                text: name || 'Team Enfactum',
                fontfile: fontPath,
                fontsize: 60,
                fontcolor: 'white',
                x: '(w-text_w)/2',
                y: 'h-(h*0.1)-th' 
            }
        })
        .format('mp4')
        .videoCodec('libx264')
        .outputOptions('-preset ultrafast')
        .on('error', (err, stdout, stderr) => {
            console.error('FFmpeg Error:', stderr);
            res.status(500).send('Error baking video');
        })
        .on('end', () => {
            // Once baking is finished, read the file and send it
            const videoBuffer = fs.readFileSync(outputPath);
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="Enfactum_${name}.mp4"`);
            res.send(videoBuffer);
            
            // Clean up the temp file
            fs.unlinkSync(outputPath);
        })
        .save(outputPath); // Save to temp storage first
}
