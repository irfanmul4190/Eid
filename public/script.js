const img = document.getElementById('baseImage');
const canvas = document.getElementById('recorderCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('employeeName');
const logoInput = document.getElementById('logoUpload');
const btn = document.getElementById('recordBtn');

canvas.width = 1748;
canvas.height = 2480;

let uploadedLogo = null;

// Initial black fill
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function updatePreview() {
    // 1. Draw the Background Image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // 2. Draw Name
    ctx.fillStyle = "black";
    ctx.font = "bold 90px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(nameInput.value, canvas.width / 2, canvas.height * 0.85);

    // 3. Draw Logo Preview
    if (uploadedLogo) {
        const width = 450;
        const aspect = uploadedLogo.width / uploadedLogo.height;
        const height = width / aspect;
        ctx.drawImage(uploadedLogo, (canvas.width - width) / 2, 1300, width, height);
    }
}

// Crucial: Only draw once the image is definitely loaded
img.onload = () => { updatePreview(); };
// If image was already cached/loaded
if (img.complete) { updatePreview(); }

nameInput.oninput = updatePreview;

logoInput.onchange = function(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const tempImg = new Image();
        tempImg.onload = () => { uploadedLogo = tempImg; updatePreview(); };
        tempImg.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

btn.onclick = async function() {
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a name!");

    btn.innerText = "Generating PNG...";
    btn.disabled = true;

    let logoBase64 = "";
    if (logoInput.files[0]) {
        const reader = new FileReader();
        logoBase64 = await new Promise(r => {
            reader.onload = () => r(reader.result);
            reader.readAsDataURL(logoInput.files[0]);
        });
    }

    try {
        const response = await fetch('/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, logoData: logoBase64 })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Summit_Card.png";
            a.click();
        } else { alert("Server error. Check Vercel logs."); }
    } catch (e) { alert("Connection failed."); }

    btn.disabled = false;
    btn.innerText = "Personalize & Download";
};
