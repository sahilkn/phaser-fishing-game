import { gameState } from '../constants/gameState.js';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('start_bg', 'assets/start_bg.png');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const padding = 40;
        const buttonGap = 30;

        const bg = this.add.image(0, 0, 'start_bg')
            .setOrigin(0,0)
            .setDisplaySize(width,height)
            .setDepth(-1);
        
        const username = gameState?.user?.username || 'Fisher';

        this.add.text(centerX, padding, `Welcome, ${username}`, { 
            fontSize: '32px', 
            color: '#ffffff',
            //fontFamily:'MicroFont', 
            }).setOrigin(0.5);

        const fishingBtn = this.add.text(centerX, height - buttonGap * 4, 'Choose Location', { 
            fontSize: '24px', 
            color: '##648f5d', 
            //backgroundColor: '#000000',
            //fontFamily:'MicroFont', 
            padding: { x: 10, y: 5 } 
            }).setOrigin(0.5).setInteractive();

        fishingBtn.on('pointerdown', () => {
            this.scene.start('Locations');
        });

        const inventoryButton = this.add.text(centerX, height - buttonGap * 3, 'Inventory', {
            fontSize: '24px', 
            color: '#d4a53f', 
            //backgroundColor: '#000000', 
            //fontFamily:'MicroFont',
            padding: { x: 10, y: 5 } 
            }).setOrigin(0.5).setInteractive();

        inventoryButton.on('pointerdown', () => {
            this.scene.start('Inventory');
        });

        const aquariumBtn = this.add.text(centerX, height - buttonGap * 2, 'Go to Aquarium', { 
            fontSize: '24px', 
            color: '#00ffff', 
            //backgroundColor: '#000000',
            //fontFamily:'MicroFont', 
            padding: { x: 10, y: 5 } })
            .setOrigin(0.5)
            .setInteractive();

        aquariumBtn.on('pointerdown', () => {
            this.scene.start('Aquarium');
        });

        const profileButton = this.add.text(centerX, height - buttonGap, 'User Profile', { 
            fontSize: '24px', 
            color: '#e26245', 
            //backgroundColor: '#000000',
            //fontFamily:'MicroFont', 
            padding: { x: 10, y: 5 } })
            .setOrigin(0.5)
            .setInteractive();

        profileButton.on('pointerdown', () => {
            this.scene.start('Profile');
        });
        
    }
}
