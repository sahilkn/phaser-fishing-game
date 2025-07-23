export function generateFishSprite(scene, fish) {
        const { 
            key, 
            width, 
            height, 
            bodyColor, 
            tailColor, 
            hasStripes,
            stripeColor,
            stripePositions 
        } = fish;
        if (scene.textures.exists(key)) {
            scene.textures.remove(key);
        }

        const canvasTexture = scene.textures.createCanvas(key, width, height);
        const ctx = canvasTexture.getContext();

        ctx.fillStyle = `rgb(${bodyColor.r}, ${bodyColor.g}, ${bodyColor.b})`;
        ctx.fillRect(0, height / 4, width, height / 2);

        const tailWidth = width / 4;
        ctx.fillStyle = `rgb(${tailColor.r}, ${tailColor.g}, ${tailColor.b})`;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(tailWidth, height / 4);
        ctx.lineTo(tailWidth, (3 * height) / 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.fillRect(width - 6, height / 2 - 2, 4, 4);

        if (hasStripes && stripeColor && stripePositions.length > 0) {
            ctx.fillStyle = `rgb(${stripeColor.r}, ${stripeColor.g}, ${stripeColor.b})`;
            stripePositions.forEach(stripeX => {
                ctx.fillRect(stripeX,height/4,2,height/2);
            });
        }

        canvasTexture.refresh();
    }

export function getRandomFishType(fishTable) {
    const totalWeight = fishTable.reduce((sum, fish) => sum + fish.weight, 0);
    const roll = Phaser.Math.FloatBetween(0, totalWeight);

    let accumulated = 0;
    for (const fish of fishTable) {
        accumulated += fish.weight;
        if (roll <= accumulated) {
            return fish.type;
        }
    }

    // Fallback in case of rounding issues
    return fishTable[fishTable.length - 1].type;
}
