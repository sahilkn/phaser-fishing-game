import { gameState } from '../constants/gameState.js';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('logo', 'assets/phaser.png');
        document.fonts.load('24px MicroFont');
        document.fonts.load('24px QuicksandFont');
        //this.load.bitmapFont('microbm', 'fonts/microbm.png', 'fonts/microbm.fnt');
    }

    create() {
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        document.fonts.ready.then(() => 
        {
            this.add.text(centerX, centerY, 'Welcome to Fishing Game', { 
                fontSize: '32px', 
                color: '#ffffff',
                fontFamily:'QuicksandFont', 
                }).setOrigin(0.5);

            const fishingBtn = this.add.text(centerX, centerY + 40, 'Choose Location', { 
                fontSize: '28px', 
                color: '#00ff00', 
                backgroundColor: '#000000',
                fontFamily:'MicroFont', 
                padding: { x: 10, y: 5 } 
                }).setOrigin(0.5).setInteractive();

            fishingBtn.on('pointerdown', () => {
                this.scene.start('Locations');
            });

            const inventoryButton = this.add.text(centerX, centerY + 80, 'Inventory', {
                fontSize: '32px', 
                color: '#00ffff', 
                backgroundColor: '#000000', 
                fontFamily:'MicroFont',
                padding: { x: 10, y: 5 } 
                }).setOrigin(0.5).setInteractive();

            inventoryButton.on('pointerdown', () => {
                this.scene.start('Inventory');
            });

            const aquariumBtn = this.add.text(centerX, centerY + 120, 'Go to Aquarium', { fontSize: '32px', color: '#00ffff', backgroundColor: '#000000', padding: { x: 10, y: 5 } })
                .setOrigin(0.5)
                .setInteractive();

            aquariumBtn.on('pointerdown', () => {
                this.scene.start('Aquarium');
            });
        });
    }
}
