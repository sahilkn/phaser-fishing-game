import { gameState } from '../constants/gameState.js';
import { fishingLocations } from '../constants/locations.js';

export class Locations extends Phaser.Scene {
    constructor() {
        super('Locations');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        // Header
        this.add.text(centerX, 50, 'Choose a Fishing Location', {
            fontSize: '32px',
            //fontFamily:'MicroFont',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create scrollable container
        this.scrollContainer = this.add.container(0, 100);
        let offsetY = 0;

        Object.entries(fishingLocations).forEach(([key, loc]) => {
            const isUnlocked = gameState.level >= loc.minLevel;

            // Create a mini container to group all elements of the card
            const cardContainer = this.add.container(centerX, offsetY);

            // Card background
            const bg = this.add.rectangle(0, 0, width * 0.9, 150, loc.color)
                .setOrigin(0.5)
                .setStrokeStyle(2, isUnlocked ? 0xffffff : 0x888888);

            // Name
            const name = this.add.text(0, -45, loc.name, {
                fontSize: '24px',
                //fontFamily:'MicroFont',
                color: isUnlocked ? '#ffffff' : '#aaaaaa'
            }).setOrigin(0.5);

            // Description
            const description = this.add.text(0, -15, loc.description, {
                fontSize: '16px',
                //fontFamily:'MicroFont',
                color: '#eeeeee',
                wordWrap: { width: width * 0.8 }
            }).setOrigin(0.5, 0);

            // Fish types
            const fishList = loc.fishTable.map(f => f.type).join(', ');
            const fishText = this.add.text(0, 50, `Fish: ${fishList}`, {
                fontSize: '14px',
                //fontFamily:'MicroFont',
                color: '#cceeff'
            }).setOrigin(0.5);

            cardContainer.add([bg,name,description,fishText]);

            // Lock overlay
            if (!isUnlocked) {
            // Dim overlay
            const overlay = this.add.rectangle(0, 0, width * 0.9, 150, 0x000000, 0.5).setOrigin(0.5);
            const lockText = this.add.text(0, 0, `🔒 Unlocks at Level ${loc.minLevel}`, {
                fontSize: '18px',
                //fontFamily:'MicroFont',
                color: '#ffaaaa',
                backgroundColor: '#00000088',
                padding: { x: 6, y: 4 }
            }).setOrigin(0.5);
            cardContainer.add([overlay, lockText]);
        } else {
            bg.setInteractive().on('pointerdown', () => {
                gameState.currentLocationKey = key;
                this.scene.start('Fishing');
            });
        }

            this.scrollContainer.add(cardContainer);
            offsetY += 180;
        });

        // Drag scrolling
        this.input.on('pointermove', pointer => {
            if (pointer.isDown) {
                this.scrollContainer.y += pointer.velocity.y * 0.1;
                const minY = Math.min(height - offsetY - 100, 100); // Clamp upper bound
                this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y, minY, 100);
            }
        });

        // Back Button
        this.add.text(30, height - 40, '← Back', {
            fontSize: '24px',
            //fontFamily:'MicroFont',
            color: '#ffffff'
        }).setInteractive().on('pointerdown', () => {
            this.scene.start('Start');
        });
    }
}
