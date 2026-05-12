export const removeWhiteBackground = (dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Scale down image if it's too large to save space in Firestore
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const threshold = 230; // Colors with r,g,b > 230 will become transparent

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (r > threshold && g > threshold && b > threshold) {
            data[i + 3] = 0; // Set alpha to 0 for near-white pixels
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png", 0.8));
      } catch (err) {
        console.error("Error processing image:", err);
        resolve(dataUrl); // Return original if error
      }
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
};
