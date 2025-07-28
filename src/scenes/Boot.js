export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load anything else you want early here (like logos or small assets)
        this.load.image('start_bg', 'assets/start_bg.png'); // so Start doesn't have to do it
    }

    async create() {
        // Load custom fonts
        await document.fonts.load('32px MicroFont');
        await document.fonts.load('24px QuicksandFont');

        // Wait for all fonts to be ready
        await document.fonts.ready;

        // Now safely start the rest of the game
        this.scene.start('Loading'); // or 'Start' if you skip login
    }
}
