        const upload = document.getElementById('upload');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const downloadBtn = document.getElementById('download');
        const loading = document.getElementById('loading');
        const frameSrc = './img/frame.png';
        
        // Store original image for high-quality download
        let originalImage = null;
        let originalFrame = null;

        upload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Show loading indicator
            loading.style.display = 'block';
            canvas.style.display = 'none';
            downloadBtn.style.display = 'none';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                // Load and store the original image
                originalImage = new Image();
                originalImage.onload = function() {
                    // Now load the frame
                    const frame = new Image();
                    frame.onload = function() {
                        // Store original frame for download
                        originalFrame = frame;
                        
                        // Set canvas for preview (smaller size)
                        const maxPreviewWidth = 500;
                        const scaleFactor = Math.min(1, maxPreviewWidth / frame.width);
                        
                        canvas.width = frame.width * scaleFactor;
                        canvas.height = frame.height * scaleFactor;
                        
                        // Draw preview image (scaled down for display)
                        fitImageToFrame(originalImage, frame, ctx, canvas.width, canvas.height);
                        
                        // Show canvas and download button
                        canvas.style.display = 'block';
                        downloadBtn.style.display = 'block';
                        loading.style.display = 'none';
                    };
                    frame.src = frameSrc;
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        downloadBtn.addEventListener('click', function() {
            // Show loading during high-res processing
            loading.style.display = 'block';
            
            // Create a hidden canvas for the full-size image
            const fullCanvas = document.createElement('canvas');
            fullCanvas.width = originalFrame.width;
            fullCanvas.height = originalFrame.height;
            const fullCtx = fullCanvas.getContext('2d');
            
            // Draw at full resolution
            fitImageToFrame(originalImage, originalFrame, fullCtx, fullCanvas.width, fullCanvas.height);
            
            // Create download link for the full-size image
            const link = document.createElement('a');
            link.download = 'framed_image.png';
            
            // Use timeout to allow UI to update before heavy processing
            setTimeout(() => {
                link.href = fullCanvas.toDataURL('image/png');
                link.click();
                loading.style.display = 'none';
            }, 100);
        });
        
        // Helper function to properly fit and center the image in the frame
        function fitImageToFrame(img, frame, context, width, height) {
            // Clear canvas
            context.clearRect(0, 0, width, height);
            
            // Calculate aspect ratios
            const frameAspect = frame.width / frame.height;
            const imgAspect = img.width / img.height;
            
            // Calculate dimensions to fit image properly in frame
            let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
            
            if (imgAspect > frameAspect) {
                // Image is wider than frame
                drawHeight = height;
                drawWidth = img.width * (drawHeight / img.height);
                offsetX = (width - drawWidth) / 2;
            } else {
                // Image is taller than frame
                drawWidth = width;
                drawHeight = img.height * (drawWidth / img.width);
                offsetY = (height - drawHeight) / 2;
            }
            
            // Draw the image centered
            context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            
            // Draw the frame over the image
            context.drawImage(frame, 0, 0, width, height);
        }