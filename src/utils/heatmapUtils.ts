export function updateHeatmapCanvas(
    canvas: HTMLCanvasElement,
    points: { x: number; z: number; val: number }[],
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);

    const values = points.map(p => p.val);
    const minVal = 0;
    const maxVal = Math.max(...values) - 2;
    const valRange = maxVal - minVal || 1;

    const p = 4;

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const u = px / (width - 1);
            const v = py / (height - 1);

            const worldX = bounds.minX + u * (bounds.maxX - bounds.minX);
            const worldZ = bounds.minZ + v * (bounds.maxZ - bounds.minZ);

            let num = 0;
            let den = 0;
            let exactMatch = false;
            let exactVal = 0;

            for (const point of points) {
                const dx = worldX - point.x;
                const dz = worldZ - point.z;
                const distSq = dx * dx + dz * dz;
                const dist = Math.sqrt(distSq);

                if (dist < 0.0001) {
                    exactMatch = true;
                    exactVal = point.val;
                    break;
                }

                const weight = 1 / Math.pow(dist, p);
                num += weight * point.val;
                den += weight;
            }

            let interpolatedVal;
            if (exactMatch) {
                interpolatedVal = exactVal;
            } else if (den === 0) {
                interpolatedVal = minVal;
            } else {
                interpolatedVal = num / den;
            }

            const normalized = Math.max(0, Math.min(1, (interpolatedVal - minVal) / valRange));

            let r = 0, g = 0, b = 0;

            if (normalized < 0.25) {
                const t = normalized / 0.25;
                r = 0; g = Math.floor(255 * t); b = 255;
            } else if (normalized < 0.5) {
                const t = (normalized - 0.25) / 0.25;
                r = 0; g = 255; b = Math.floor(255 * (1 - t));
            } else if (normalized < 0.8) {
                const t = (normalized - 0.5) / 0.3;
                r = Math.floor(255 * t); g = 255; b = 0;
            } else {
                const t = (normalized - 0.8) / 0.2;
                r = 255; g = Math.floor(255 * (1 - t)); b = 0;
            }

            const index = (py * width + px) * 4;
            imgData.data[index] = r;
            imgData.data[index + 1] = g;
            imgData.data[index + 2] = b;
            imgData.data[index + 3] = 170;
        }
    }

    ctx.putImageData(imgData, 0, 0);
}
