import { gameState } from '../constants/gameState.js';
import { generateFishSprite } from '../utilities/fishUtilities.js';

export class Aquarium extends Phaser.Scene {
    constructor() {
        super('Aquarium');
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x112233); // dark tank background

        // Tooltip text (initially hidden)
        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setVisible(false).setDepth(10);

        
        gameState.caughtFish.forEach((fishData, index) => {
            // If texture doesn't exist yet, generate it
            if (!this.textures.exists(fishData.key)) {
                generateFishSprite(this,fishData);
                //this.generateFishSprite(fishData);
            }

            const x = Phaser.Math.Between(100, 1180);
            const y = Phaser.Math.Between(100, 620);

            const fish = this.add.image(x, y, fishData.key);
            fish.setScale(Phaser.Math.FloatBetween(0.5, 1));
            fish.setFlipX(Math.random() > 0.5);
            fish.setInteractive({useHandCursor:true}); //make it hoverable

            // Hover events
            fish.on('pointerover', (pointer) => {
                this.tooltip.setText(fishData.name || fishData.fishType);
                this.tooltip.setPosition(pointer.x + 10, pointer.y + 10);
                this.tooltip.setVisible(true);
            });

            fish.on('pointermove', (pointer) => {
                this.tooltip.setPosition(pointer.x + 10, pointer.y + 10);
            });

            fish.on('pointerout', () => {
                this.tooltip.setVisible(false);
            });

            this.animateFish(fish);
        });

        // Back Button
        const backButton = this.add.text(30, 660, '← Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('Locations');
        });
        }

    animateFish(fish) {
    const aquariumBounds = {
        xMin: 50,
        xMax: 1230,
        yMin: 50,
        yMax: 670
    };

    const swimToNewPosition = () => {
        const targetX = Phaser.Math.Between(aquariumBounds.xMin, aquariumBounds.xMax);
        const targetY = Phaser.Math.Between(aquariumBounds.yMin, aquariumBounds.yMax);

        const distance = Phaser.Math.Distance.Between(fish.x, fish.y, targetX, targetY);
        const isDart = Math.random() < 0.1; // 10% chance to dart
        const isIdle = Math.random() < 0.15; // 15% chance to idle float

        const speed = isDart ? Phaser.Math.Between(150, 200) : isIdle ? 20 : Phaser.Math.Between(40, 70);
        const duration = (distance / speed) * 1000;

        fish.setFlipX(targetX < fish.x);

        this.tweens.add({
            targets: fish,
            x: targetX,
            y: targetY,
            duration,
            ease: isDart ? 'Expo.easeOut' : 'Sine.easeInOut',
            onComplete: () => {
                const delay = Phaser.Math.Between(500, 1500); // pause between moves
                this.time.delayedCall(delay, swimToNewPosition);
            }
        });

        // Add gentle wiggle on Y-axis for natural movement
        const wiggleAmplitude = Phaser.Math.Between(5, 15);
        const wiggleDuration = Phaser.Math.Between(500, 1000);

        // Stop any previous wiggle
        if (fish._wiggleTween) {
            fish._wiggleTween.stop();
        }

        fish._wiggleTween = this.tweens.add({
            targets: fish,
            y: {
                getStart: () => fish.y,
                getEnd: () => fish.y + Phaser.Math.Between(-wiggleAmplitude, wiggleAmplitude)
            },
            duration: wiggleDuration,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    };

    swimToNewPosition();
}


    // generateFishSprite(fish) {
    //     const { 
    //         key, 
    //         width, 
    //         height, 
    //         bodyColor, 
    //         tailColor, 
    //         hasStripes,
    //         stripeColor,
    //         stripePositions 
    //     } = fish;
    //     if (this.textures.exists(key)) {
    //         this.textures.remove(key);
    //     }

    //     const canvasTexture = this.textures.createCanvas(key, width, height);
    //     const ctx = canvasTexture.getContext();

    //     ctx.fillStyle = `rgb(${bodyColor.r}, ${bodyColor.g}, ${bodyColor.b})`;
    //     ctx.fillRect(0, height / 4, width, height / 2);

    //     const tailWidth = width / 4;
    //     ctx.fillStyle = `rgb(${tailColor.r}, ${tailColor.g}, ${tailColor.b})`;
    //     ctx.beginPath();
    //     ctx.moveTo(0, height / 2);
    //     ctx.lineTo(tailWidth, height / 4);
    //     ctx.lineTo(tailWidth, (3 * height) / 4);
    //     ctx.closePath();
    //     ctx.fill();

    //     ctx.fillStyle = "#000000";
    //     ctx.fillRect(width - 6, height / 2 - 2, 4, 4);

    //     if (hasStripes && stripeColor && stripePositions.length > 0) {
    //         ctx.fillStyle = `rgb(${stripeColor.r}, ${stripeColor.g}, ${stripeColor.b})`;
    //         stripePositions.forEach(stripeX => {
    //             ctx.fillRect(stripeX,height/4,2,height/2);
    //         });
    //     }

    //     canvasTexture.refresh();
    // }
}
