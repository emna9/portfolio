import * as THREE from 'three';

let gardenTexture = null;

/**
 * A small hand-drawn garden seen through the windows.
 * Muted greens, cream sky and warm brown branches keep it inside the palette.
 */
export const getGardenTexture = () => {
    if (gardenTexture || typeof document === 'undefined') return gardenTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Warm cream sky
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, '#f7f0dd');
    sky.addColorStop(0.55, '#eef0dd');
    sky.addColorStop(1, '#dfe6cf');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, size, size);

    // Warm sunlight in the garden
    const sun = ctx.createRadialGradient(105, 95, 8, 105, 95, 210);
    sun.addColorStop(0, 'rgba(255, 246, 214, 0.95)');
    sun.addColorStop(0.45, 'rgba(255, 238, 190, 0.45)');
    sun.addColorStop(1, 'rgba(255, 238, 190, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, size, size);

    // Distant hedge
    ctx.fillStyle = '#9aa982';
    ctx.beginPath();
    ctx.ellipse(120, 300, 150, 70, 0, 0, Math.PI * 2);
    ctx.ellipse(320, 290, 170, 80, 0, 0, Math.PI * 2);
    ctx.ellipse(460, 320, 110, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // A soft tree trunk and branches
    ctx.strokeStyle = '#6b4a3a';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(250, 512);
    ctx.quadraticCurveTo(238, 390, 250, 300);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(248, 360);
    ctx.quadraticCurveTo(190, 300, 150, 270);
    ctx.moveTo(252, 340);
    ctx.quadraticCurveTo(320, 290, 370, 250);
    ctx.stroke();

    // Canopy
    ctx.fillStyle = '#7f9268';
    ctx.beginPath();
    ctx.ellipse(250, 235, 150, 85, 0, 0, Math.PI * 2);
    ctx.ellipse(155, 255, 85, 55, 0, 0, Math.PI * 2);
    ctx.ellipse(350, 250, 95, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mid and foreground bushes
    ctx.fillStyle = '#6f8257';
    ctx.beginPath();
    ctx.ellipse(70, 400, 100, 75, 0, 0, Math.PI * 2);
    ctx.ellipse(190, 420, 120, 80, 0, 0, Math.PI * 2);
    ctx.ellipse(330, 430, 130, 85, 0, 0, Math.PI * 2);
    ctx.ellipse(470, 405, 95, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // A pale garden path
    ctx.fillStyle = 'rgba(232, 222, 196, 0.85)';
    ctx.beginPath();
    ctx.moveTo(215, 512);
    ctx.quadraticCurveTo(235, 430, 275, 370);
    ctx.quadraticCurveTo(300, 420, 310, 512);
    ctx.closePath();
    ctx.fill();

    // Grass strokes
    ctx.strokeStyle = '#5f7350';
    ctx.lineWidth = 2;
    for (let i = 0; i < 80; i += 1) {
        const x = Math.random() * size;
        const y = 380 + Math.random() * 130;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 3, y - 10, x + (Math.random() * 8 - 4), y - 18);
        ctx.stroke();
    }

    // Tiny flowers
    const flowerColors = ['#f3e3c8', '#d9a6a0', '#e8d9b4'];
    for (let i = 0; i < 26; i += 1) {
        ctx.fillStyle = flowerColors[i % flowerColors.length];
        const x = 30 + Math.random() * (size - 60);
        const y = 400 + Math.random() * 100;
        ctx.beginPath();
        ctx.arc(x, y, 2.5 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    gardenTexture = new THREE.CanvasTexture(canvas);
    gardenTexture.colorSpace = THREE.SRGBColorSpace;
    return gardenTexture;
};

let sunGlowTexture = null;

export const getSunGlowTexture = () => {
    if (sunGlowTexture || typeof document === 'undefined') return sunGlowTexture;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const glow = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
    glow.addColorStop(0, 'rgba(255, 249, 226, 1)');
    glow.addColorStop(0.35, 'rgba(255, 238, 190, 0.72)');
    glow.addColorStop(1, 'rgba(255, 238, 190, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
    sunGlowTexture = new THREE.CanvasTexture(canvas);
    sunGlowTexture.colorSpace = THREE.SRGBColorSpace;
    return sunGlowTexture;
};

export default getGardenTexture;
