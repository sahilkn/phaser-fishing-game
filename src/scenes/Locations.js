import { gameState } from '../constants/gameState.js';
import { fishingLocations } from '../constants/locations.js';

export class Locations extends Phaser.Scene {
    constructor() {
        super('Locations');
    }

    create() {
        const centerX = this.cameras.main.centerX;
        let offsetY = 150;

        this.add.text(centerX, 80, 'Choose a Fishing Location', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

        Object.entries(fishingLocations).forEach(([key, location]) => {
            const button = this.add.text(centerX, offsetY, location.name, {
                fontSize: '24px',
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: { x: 10, y: 5 }
            })
                .setOrigin(0.5)
                .setInteractive();

            button.on('pointerdown', () => {
                gameState.currentLocationKey = key;
                this.scene.start('Fishing');
            });

            offsetY += 60;
        });

        const back = this.add.text(30, 660, '← Back', { fontSize: '24px', color: '#ffffff' }).setInteractive();
        back.on('pointerdown', () => {
            this.scene.start('Start'); 
        });
    }
}
