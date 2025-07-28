import { fishingLocations } from '../constants/locations.js';
import { gameState } from '../constants/gameState.js';
import { auth, db } from '../constants/firebase.js';
import { getRandomFishType,fishProfiles } from '../utilities/fishUtilities.js';

function saveGameState(gameState) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        db.collection('saves').doc(uid).set({
            user: gameState.user,
            xp: gameState.xp,
            level:gameState.level,
            fish: gameState.caughtFish,
            fishCounter:gameState.fishCounter,
            gold:gameState.gold,
            timestamp: Date.now()
        });
}


export class Fishing extends Phaser.Scene {

    constructor() 
    {
        super('Fishing');
        this.fishCounter = 0;
        this.spawnedFish = [];
    }

    init(data) 
    {
        this.locationKey = gameState.currentLocationKey || 'lake'; // default location
        this.location = fishingLocations[this.locationKey];
        this.fishCounter = 0;
        this.spawnedFish = [];
    }


    preload() 
    {

    }

    create() 
    {
        //Background color
        const { width, height } = this.scale;
        this.add.rectangle(width /2 , height / 2, width, height, this.location.color); // location-based background
        this.add.text(640, 40, this.location.name, { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);

        // Add player (placeholder square)
        this.player = this.add.rectangle(640, 400, 40, 40, 0xffffff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Text: "Press Spacebar to go fishing!"
        this.add.text(50, 50, 'Press Spacebar to go fishing!', {
            fontSize: '20px',
            color: '#dddddd'
        });

        // Back button
        const backButton = this.add.text(640, 680, 'Back to Start', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });

        // Circle mini-game setup
        this.circleClickCount = 0;
        this.targetCircleClicks = Phaser.Math.Between(2, 4);
        this.isFishing = false;
        this.fishingCircles = [];

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        
        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;
            // You can reposition UI or adjust layout here if needed
            });
    }

    update() {
        if (!this.player || !this.cursors) return;

        const speed = 200;
        const body = this.player.body;

        body.setVelocity(0);

        if (this.cursors.left.isDown) body.setVelocityX(-speed);
        if (this.cursors.right.isDown) body.setVelocityX(speed);
        if (this.cursors.up.isDown) body.setVelocityY(-speed);
        if (this.cursors.down.isDown) body.setVelocityY(speed);

        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && !this.isFishing) {
            this.startFishingMiniGame();
        }
    }

    generateFishSprite(key, fishType)
    {
        const profile = fishProfiles[fishType] || {
            baseColor: Phaser.Display.Color.RandomRGB(),
            tailColor: Phaser.Display.Color.RandomRGB(),
            allowStripes: true,
            sizeRange: { width: [64, 96], height: [32, 64] }
        };

        const width = Phaser.Math.Between(...profile.sizeRange.width);
        const height = Phaser.Math.Between(...profile.sizeRange.height);

        // Create canvas texture
        if (this.textures.exists(key)) this.textures.remove(key);
        const canvasTexture = this.textures.createCanvas(key, width, height);
        const ctx = canvasTexture.getContext();

        //Base body color
        const bodyColor = profile.baseColor;
        ctx.fillStyle = `rgb(${bodyColor.r}, ${bodyColor.g}, ${bodyColor.b})`;
        ctx.fillRect(0, height / 4, width, height / 2);

        // Tail (triangle shape)
        const tailColor = profile.tailColor;
        const tailWidth = width / 4;
        ctx.fillStyle = `rgb(${tailColor.r}, ${tailColor.g}, ${tailColor.b})`;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(tailWidth, height / 4);
        ctx.lineTo(tailWidth, (3 * height) / 4);
        ctx.closePath();
        ctx.fill();

        // Eye (simple black square)
        ctx.fillStyle = "#000000";
        ctx.fillRect(width - 6, height / 2 - 2, 4, 4);

        // Optionally add stripes
        let hasStripes = false;
        let stripeColor = null;
        let stripePositions = [];
        if (profile.allowStripes && Math.random() > 0.4) {
            hasStripes = true;
            stripeColor = profile.stripeColor || Phaser.Display.Color.RandomRGB();
            ctx.fillStyle = `rgb(${stripeColor.r}, ${stripeColor.g}, ${stripeColor.b})`;
            for (let i = 0; i < 3; i++) {
                const stripeX = Phaser.Math.Between(tailWidth + 2, width - 10);
                ctx.fillRect(stripeX, height / 4, 2, height / 2);
                stripePositions.push(stripeX);
            }
        }

        // Finalize texture for use in Phaser
        canvasTexture.refresh();

        return { 
            key,
            width,
            height,
            fishType,
            bodyColor,
            tailColor,
            hasStripes,
            stripeColor,
            stripePositions,
            timestamp: Date.now() 
            };
    }

    catchFish() {
        // Remove old fish graphics if any
        this.spawnedFish.forEach(fish => fish.destroy());
        this.spawnedFish = [];

        const fishType = getRandomFishType(this.location.fishTable);
        const fishKey = `fish_${gameState.fishCounter++}`;

        const fishData = this.generateFishSprite(fishKey, fishType);
        fishData.fishType = fishType;

        const gainedXP = Phaser.Math.Between(5, 10);
        const baseGold = fishProfiles[fishType]?.baseGold || 10;
        const goldEarned = Phaser.Math.Between(baseGold - 5, baseGold + 5);
        gameState.addXP(gainedXP);
        gameState.addGold(goldEarned);

        this.showCatchPopup(fishData, fishKey, fishType, gainedXP, goldEarned);
    }


    showCatchPopup(fishData, fishKey, fishType, gainedXP,goldEarned) 
    {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Background overlay
        const overlay = this.add.rectangle(centerX, centerY, 1280, 720, 0x000000, 0.8);
        overlay.setDepth(100);

        // Congratulations text
        const message = this.add.text(centerX, centerY - 200,
            `🎉 CONGRATULATIONS! 🎉\nYou caught a ${fishData.fishType}!`, {
            fontSize: '32px',
            //fontFamily:'MicroFont', 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(101);

        // Fish sprite
        const fishSprite = this.add.image(centerX, centerY - 50, fishData.key)
            .setScale(2)
            .setDepth(101);

        // Gold earned text
        const goldText = this.add.text(centerX, centerY + 20, `💰 +${goldEarned} gold`, {
            fontSize: '20px',
            color: '#ffff00'
        }).setOrigin(0.5).setDepth(101);

        // Input label
        const nameLabel = this.add.text(centerX - 150, centerY + 80, 'Name your fish:', {
            fontSize: '20px',
            //fontFamily:'MicroFont', 
            color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(101);

        // DOM Input element
        const nameInput = this.add.dom(centerX + 80, centerY + 80, 'input', {
            type: 'text',
            width: '200px',
            fontSize: '16px',
            fontFamily:'MicroFont'
        });
        nameInput.setDepth(101);
        nameInput.node.value = fishData.fishType;

        // OK button
        const okButton = this.add.text(centerX, centerY + 150, 'OK', {
            fontSize: '24px',
            //fontFamily:'MicroFont', 
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive().setDepth(101);

        okButton.on('pointerdown', () => {
            let customName = nameInput.node.value.trim();

        // ✅ Fallback: if empty, default to fish type
            if (customName === '') {
                customName = fishType;
            }

            fishData.name = customName || fishData.fishType;
            fishData.fishType = fishType;

            //Add fish to gameState after naming
            gameState.addFish(fishData);

            //award XP
            gameState.addXP(gainedXP);

            //save to firestore AFTER naming fish
            saveGameState(gameState);

            // Clean up all elements
            overlay.destroy();
            message.destroy();
            fishSprite.destroy();
            nameLabel.destroy();
            nameInput.destroy();
            okButton.destroy();
            goldText.destroy();

            this.isFishing = false;
        });
    }

    //Fishing mini-game methods
    startFishingMiniGame() {
        this.isFishing = true;
        this.circleClickCount = 0;
        this.targetCircleClicks = Phaser.Math.Between(2, 4);

        // Create semi-transparent background overlay
        this.fishingOverlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            1280, 720,
            0x000000, 0.7
        ).setDepth(50);

        this.fishingCircles = []; // Clear old array
        this.spawnNextCircle();
    }

    spawnNextCircle() {
        const x = Phaser.Math.Between(100, 1180);
        const y = Phaser.Math.Between(100, 600);
        const circle = this.add.circle(x, y, 30, 0xff0000)
        .setInteractive()
        .setDepth(51); //above the overlay

        circle.on('pointerdown', () => {
            circle.destroy();
            this.circleClickCount++;

            if (this.circleClickCount >= this.targetCircleClicks) {
                this.endFishingMiniGame();
                this.catchFish();
            } else {
                this.spawnNextCircle();
            }
        });

        this.fishingCircles.push(circle);
    }

    endFishingMiniGame() {
        if (this.fishingOverlay) {
            this.fishingOverlay.destroy();
            this.fishingOverlay = null;
        }

        this.fishingCircles.forEach(circle => circle.destroy());
        this.fishingCircles = [];
    }



    

}
