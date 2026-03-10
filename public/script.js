const video = document.getElementById('baseVideo');
const canvas = document.getElementById('recorderCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('employeeName');
const btn = document.getElementById('recordBtn');

// --- 1. INITIALIZATION: Force the video to wake up ---
video.muted = true;
video.playsInline = true;
video.preload = "auto";
video.src = "assets/Eid.mp4"; // Ensure path is correct

// This forces the first frame to load into the canvas buffer immediately
video.load();
video.play().then(() => {
    video.pause(); 
    video.currentTime = 0;
}).catch(err => {
    console.log("Waiting for user interaction to play video.");
});

// --- 2. DYNAMIC RESIZING: Sync canvas to video dimensions ---
video.addEventListener('loadeddata', function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the first frame so the box isn't black on arrival
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
});

// --- 3. PREVIEW LOOP: Show the name on screen in real-time ---
function drawLoop() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "italic 60px EnfactumFont, Georgia, serif"; 
    ctx.textAlign = "center";
    
    // Smart Positioning: 10% up from the bottom
    ctx.fillText(nameInput.value, canvas.width / 2, canvas.height * 0.9);

    if (!video.paused && !video.ended) {
        requestAnimationFrame(drawLoop);
    }
}

// Update the canvas preview as the user types
nameInput.addEventListener('input', () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.fillText(nameInput.value, canvas.width / 2, canvas.height * 0.9);
});

// --- 4. THE DOWNLOAD TRIGGER: Handshake with Vercel API ---
btn.onclick = function() {
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a name!");

    // Play preview locally
    video.currentTime = 0;
    video.play();
    drawLoop();

    // Trigger the Vercel Backend "Baker"
    btn.innerText = "Baking Video... Please Wait";
    btn.disabled = true;

    // Redirect to the /render route defined in vercel.json
    window.location.href = `/render?name=${encodeURIComponent(name)}`;
    
    // Re-enable button after a short delay
    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = "Personalize & Download";
    }, 5000);
};
