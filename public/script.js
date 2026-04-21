const img = document.getElementById('baseImage');
const canvas = document.getElementById('recorderCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('employeeName');

// A5 Dimensions (roughly)
canvas.width = 1748;
canvas.height = 2480;

function updatePreview() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "italic 80px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(nameInput.value, canvas.width / 2, canvas.height * 0.95);
}

// Draw when image loads and when user types
img.onload = updatePreview;
nameInput.addEventListener('input', updatePreview);
