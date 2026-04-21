const img = document.getElementById('baseImage');
const canvas = document.getElementById('recorderCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('employeeName');
const subTextInput = document.getElementById('subText');
const logoInput = document.getElementById('logoUpload');
const btn = document.getElementById('recordBtn');

// Standard A5 Dimensions at 300 DPI
canvas.width = 1748;
canvas.height = 2480;

let uploadedLogo = null;

// Handle Logo Preview
logoInput.onchange = function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const tempImg = new Image();
        tempImg.onload = function() {
            uploadedLogo = tempImg;
            updatePreview();
        };
        tempImg.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

function updatePreview() {
    // Draw Background
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Draw Name (Bold, Non-Italic)
    ctx.fillStyle = "black";
    ctx.font = "bold 80px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(nameInput.value, canvas.width / 2, canvas.height * 0.75);
    
    // Draw Subtext (All Caps, Normal weight)
    ctx.font = "50px sans-serif";
    ctx.fillText(subTextInput.value.toUpperCase(), canvas.width / 2, canvas.height * 0.82);

    // Draw uploaded logo preview if exists
    if (uploadedLogo) {
        const aspect = uploadedLogo.width / uploadedLogo.height;
        const width = 400;
        const height = width / aspect;
        ctx.drawImage(uploadedLogo, (canvas.width - width) / 2, canvas.height * 0.5, width, height);
    }
}

img.onload = updatePreview;
nameInput.oninput = updatePreview;
subTextInput.oninput = updatePreview;

btn.onclick = async function() {
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a name!");

    btn.innerText = "Generating PNG...";
    btn.disabled = true;

    let logoBase64 = "";
    if (logoInput.files[0]) {
        const reader = new FileReader();
        logoBase64 = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(logoInput.files[0]);
        });
    }

    try {
        const response = await fetch('/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name,
                subText: subTextInput.value.toUpperCase(),
                logoData: logoBase64 
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Summit_Card_${name}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            alert("Server Error. Check Vercel logs.");
        }
    } catch (err) {
        console.error(err);
        alert("Connection failed.");
    }

    btn.disabled = false;
    btn.innerText = "Personalize & Download";
};
