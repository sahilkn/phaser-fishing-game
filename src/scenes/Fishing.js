import { fishingLocations } from '../constants/locations.js';
import { gameState } from '../constants/gameState.js';
import { auth, db } from '../constants/firebase.js';
import { getRandomFishType } from '../utilities/fishUtilities.js';

function saveGameState(gameState) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        db.collection('saves').doc(uid).set({
            xp: gameState.xp,
            fish: gameState.caughtFish,
            fishCounter:gameState.fishCounter,
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
        this.load.image('background', 'assets/space.png');
        this.load.image('logo', 'assets/phaser.png');
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });        
    }

    create() 
    {
        //Background color
        this.add.rectangle(640, 360, 1280, 720, this.location.color); // location-based background
        this.add.text(640, 40, this.location.name, { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        //generate fish button
        const testButton = this.add.text(centerX,centerY,'Catch Fish').setOrigin(0.5).setInteractive();
        testButton.on(
            "pointerdown",
            (pointer,localX,localY,event) =>
            {
                //Remove previously destroyed fish
                this.spawnedFish.forEach(fish => fish.destroy());
                this.spawnedFish = [];

                //xp earned
                let xpEarned = 0;

                //generate a fish
                const fishType = getRandomFishType(this.location.fishTable);
                const fishKey = `fish_${gameState.fishCounter++}`;

                //Store metadata
                const fishData = this.generateFishSprite(fishKey);
                fishData.fishType = fishType;
                //gameState.addFish(fishData);

                // Give XP
                const gainedXP = Phaser.Math.Between(5, 10);
                gameState.addXP(gainedXP); 
                xpEarned += gainedXP;     

                //save gamestate
                //saveGameState(gameState);

                //display stuff
                this.showCatchPopup(fishData,fishKey,fishType,gainedXP);
            });

        //Inventory button
        const inventoryButton = this.add.text(centerX, centerY + 220, 'Inventory', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        inventoryButton.on('pointerdown', () => {
            this.scene.start('Inventory');
        });


        //aquarium button
        const aquariumButton = this.add.text(centerX, centerY + 260, 'Go to Aquarium', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        aquariumButton.on('pointerdown', () => {
            this.scene.start('Aquarium');
        });

        //Profile button
        const profileButton = this.add.text(centerX, centerY + 300, 'Profile', {
            fontSize: '24px',
            color: '#ff0000',
            backgroundColor: '#000000',
        }).setOrigin(0.5).setInteractive();

        profileButton.on('pointerdown', () => {
            this.scene.start('Profile');
        });

        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;
            // You can reposition UI or adjust layout here if needed
            });
    }

    generateFishSprite(key)
    {
        const width = Phaser.Math.Between(64,96);
        const height = Phaser.Math.Between(32, 64);

        // Create canvas texture
        if (this.textures.exists(key)) this.textures.remove(key);
        const canvasTexture = this.textures.createCanvas(key, width, height);
        const ctx = canvasTexture.getContext();

        //Base body color
        const tBColor = Phaser.Display.Color.RandomRGB();
        const bodyColor = { r: tBColor.r, g: tBColor.g, b: tBColor.b };
        ctx.fillStyle = `rgb(${bodyColor.r}, ${bodyColor.g}, ${bodyColor.b})`;
        ctx.fillRect(0, height / 4, width, height / 2);

        // Tail (triangle shape)
        const tTColor = Phaser.Display.Color.RandomRGB();
        const tailColor = { r: tTColor.r, g: tTColor.g, b: tTColor.b };
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
        if (Math.random() > 0.5) {
            hasStripes = true;
            const tSColor = Phaser.Display.Color.RandomRGB();
            stripeColor = {r:tSColor.r,g:tSColor.g, b: tSColor.b};
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
            bodyColor,
            tailColor,
            hasStripes,
            stripeColor: hasStripes ? stripeColor: null,
            stripePositions 
            };
    }

    showCatchPopup(fishData, fishKey, fishType, gainedXP) 
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
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(101);

        // Fish sprite
        const fishSprite = this.add.image(centerX, centerY - 50, fishData.key)
            .setScale(2)
            .setDepth(101);

        // Input label
        const nameLabel = this.add.text(centerX - 150, centerY + 80, 'Name your fish:', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(101);

        // DOM Input element
        const nameInput = this.add.dom(centerX + 80, centerY + 80, 'input', {
            type: 'text',
            width: '200px',
            fontSize: '16px'
        });
        nameInput.setDepth(101);
        nameInput.node.value = fishData.fishType;

        // OK button
        const okButton = this.add.text(centerX, centerY + 150, 'OK', {
            fontSize: '24px',
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
        });
    }


    

}
