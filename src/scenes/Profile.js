import { gameState } from '../constants/gameState.js';

export class Profile extends Phaser.Scene {
    constructor() {
        super('Profile');
    }

    create() {
        const centerX = this.cameras.main.centerX;

        const {level,xp,caughtFish,gold} = gameState;
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e); // dark background

        // Placeholder Profile Picture (a square)
        this.add.rectangle(centerX, 120, 100, 100, 0x999999)
            .setStrokeStyle(2, 0xffffff);

        this.add.text(centerX, 190, 'Profile Picture', {
            fontSize: '16px',
            //fontFamily:'MicroFont',
            color: '#cccccc'
        }).setOrigin(0.5);

        // Fishing Level
        this.add.text(centerX, 260, `Fishing Level: ${level}`, {
            //fontFamily: 'MicroFont',
            fontSize: '24px',
            color: '#00ffcc'
        }).setOrigin(0.5);

        // XP Progress
        const xpToNext = level * 100;
        this.add.text(centerX, 300, `XP: ${xp} / ${xpToNext}`, {
            fontSize: '20px',
            //fontFamily:'MicroFont',
            color: '#88ffff'
        }).setOrigin(0.5);

        // Total Fish Caught
        this.add.text(centerX, 320, `Total Fish Caught: ${caughtFish.length}`, {
            fontSize: '24px',
            //fontFamily:'MicroFont',
            color: '#00ffcc'
        }).setOrigin(0.5);

        //Gold earned button
        this.add.text(centerX, 360, `Gold: ${gold}`, {
            fontSize: '24px',
            color: '#ffd700' // gold color
        }).setOrigin(0.5);


        // Back Button
        const backButton = this.add.text(30, 660, '← Back', {
            fontSize: '24px',
            //fontFamily:'MicroFont',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
    }
}
