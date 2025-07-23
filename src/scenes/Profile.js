import { gameState } from '../constants/gameState.js';

export class Profile extends Phaser.Scene {
    constructor() {
        super('Profile');
    }

    create() {
        const centerX = this.cameras.main.centerX;

        const {level,xp,caughtFish} = gameState;

        // Background
        this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e); // dark background

        // Placeholder Profile Picture (a square)
        this.add.rectangle(centerX, 120, 100, 100, 0x999999)
            .setStrokeStyle(2, 0xffffff);

        this.add.text(centerX, 190, 'Profile Picture', {
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);

        // Fishing Level
        this.add.text(centerX, 260, `Fishing Level: ${level}`, {
            fontFamily: 'QuicksandFont',
            fontSize: '24px',
            color: '#00ffcc'
        }).setOrigin(0.5);

        // XP Progress
        const xpToNext = level * 100;
        this.add.text(centerX, 300, `XP: ${xp} / ${xpToNext}`, {
            fontSize: '20px',
            color: '#88ffff'
        }).setOrigin(0.5);

        // Total Fish Caught
        this.add.text(centerX, 320, `Total Fish Caught: ${caughtFish.length}`, {
            fontSize: '24px',
            color: '#00ffcc'
        }).setOrigin(0.5);

        // Back Button
        const backButton = this.add.text(30, 660, '← Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('Fishing');
        });
    }
}
