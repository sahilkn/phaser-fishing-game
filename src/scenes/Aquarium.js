import { gameState } from '../constants/gameState.js';
import { generateFishSprite } from '../utilities/fishUtilities.js';

export class Aquarium extends Phaser.Scene {
    constructor() {
        super('Aquarium');
    }

    create() {
        const { width, height } = this.scale;
        this.add.rectangle(width/2, height/2, width, height, 0x112233); // dark tank background

        // Tooltip text (initially hidden)
        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '18px',
            //fontFamily:'MicroFont',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setVisible(false).setDepth(10);

        
        gameState.caughtFish.forEach((fishData, index) => {
            // If texture doesn't exist yet, generate it
            if (!this.textures.exists(fishData.key)) {
                generateFishSprite(this,fishData);
            }

            const padding = 50;
            const x = Phaser.Math.Between(padding, width - padding);
            const y = Phaser.Math.Between(padding, height - padding);

            const fish = this.add.image(x, y, fishData.key);
            fish.setScale(Phaser.Math.FloatBetween(0.5, 1));
            fish.setFlipX(Math.random() > 0.5);
            fish.setInteractive({useHandCursor:true}); //make it hoverable

            // Hover events
            fish.on('pointerover', (pointer) => {
                const name = fishData.name || 'Unnamed Fish';
                const type = fishData.fishType || 'Unknown Type';
                this.tooltip.setText(`${name}\nSpecies: ${type}`);

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
        const backButton = this.add.text(30, height - 40, '← Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
        }

    animateFish(fish) {

        const padding = 50;
        const aquariumBounds = {
            xMin: padding,
            xMax: this.scale.width - padding,
            yMin: padding,
            yMax: this.scale.height - padding
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

}
