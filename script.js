const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');
const loading = document.getElementById('loading');
const frameSelect = document.getElementById('frame');

// Frame options with correct paths
const frames = {
    'Frame 1': './img/frame1.png',
    'Frame 2': './img/frame2.png',
};

// Populate the dropdown
for (const frameName in frames) {
    const option = document.createElement('option');
    option.value = frames[frameName];
    option.textContent = frameName;
    frameSelect.appendChild(option);
}

// Initialize global variables
let originalImage = null;
let originalFrame = new Image();
originalFrame.src = frameSelect.value; // Set initial frame

// Trigger frame reload properly
originalFrame.onload = function () {
    if (originalImage) {
        applyFrame();
    }
};

upload.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    loading.style.display = 'block';
    canvas.style.display = 'none';
    downloadBtn.style.display = 'none';

    const reader = new FileReader();
    reader.onload = function (e) {
        originalImage = new Image();
        originalImage.onload = function () {
            applyFrame();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

frameSelect.addEventListener('change', function () {
    originalFrame.src = frameSelect.value; // Assign directly
});

downloadBtn.addEventListener('click', function () {
    loading.style.display = 'block';

    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = originalFrame.width;
    fullCanvas.height = originalFrame.height;
    const fullCtx = fullCanvas.getContext('2d');

    fitImageToFrame(originalImage, originalFrame, fullCtx, fullCanvas.width, fullCanvas.height);

    const link = document.createElement('a');
    link.download = 'framed_image.png';
    setTimeout(() => {
        link.href = fullCanvas.toDataURL('image/png');
        link.click();
        loading.style.display = 'none';
    }, 100);
});

function applyFrame() {
    loading.style.display = 'block';

    const maxPreviewWidth = 500;
    const scaleFactor = Math.min(1, maxPreviewWidth / originalFrame.width);
    canvas.width = originalFrame.width * scaleFactor;
    canvas.height = originalFrame.height * scaleFactor;

    fitImageToFrame(originalImage, originalFrame, ctx, canvas.width, canvas.height);

    canvas.style.display = 'block';
    downloadBtn.style.display = 'block';
    loading.style.display = 'none';
}

function fitImageToFrame(img, frame, context, width, height) {
    context.clearRect(0, 0, width, height);

    const frameAspect = frame.width / frame.height;
    const imgAspect = img.width / img.height;

    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (imgAspect > frameAspect) {
        drawHeight = height;
        drawWidth = img.width * (drawHeight / img.height);
        offsetX = (width - drawWidth) / 2;
    } else {
        drawWidth = width;
        drawHeight = img.height * (drawWidth / img.width);
        offsetY = (height - drawHeight) / 2;
    }

    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    context.drawImage(frame, 0, 0, width, height);
}
