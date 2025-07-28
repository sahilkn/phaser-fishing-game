import { gameState } from '../constants/gameState.js';
import { generateFishSprite } from '../utilities/fishUtilities.js';

export class Inventory extends Phaser.Scene {
    constructor() {
        super('Inventory');
    }

    create() {
        // Default sort method
        this.sortMethod = 'id'; // fallback option

        const { width, height } = this.scale;
        this.add.rectangle(width/2, height/2, width, height, 0x223344); // cozy background

        this.createDropdown();

        this.renderInventory();

            // Back Button
            const backButton = this.add.text(30, height - 40, '← Back', {
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

        renderInventory() {
            if (this.scrollContainer) this.scrollContainer.destroy(); // clear old
            const scrollContainer = this.add.container(0, 0);
            this.scrollContainer = scrollContainer;

            // Apply sorting
            const sortedFish = [...gameState.caughtFish];
            switch (this.sortMethod) {
                case 'name':
                    sortedFish.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    break;
                case 'fish_type':
                    sortedFish.sort((a, b) => (a.fishType || '').localeCompare(b.fishType || ''));
                    break;
                case 'date':
                    sortedFish.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)); // newest first
                    break;
                case 'id':
                default:
                    break;
            }

            const gameWidth = this.cameras.main.width;
            const padding = 20;
            const cols = 5;
            const spacing = 140;
            const baseTankSize = 140;
            const tankWidth = baseTankSize * 0.9;
            const tankHeight = baseTankSize * 0.9;

            const textHeight = 20;
            const verticalPadding = 40;

            const totalSpacing = gameWidth - padding * 2;
            const rowSpacing = tankHeight + textHeight + verticalPadding;
            const colSpacing = totalSpacing / cols;
            let row = 0;

            sortedFish.forEach((fish, index) => {
                const col = index % cols;
                if (index !== 0 && col === 0) row++;

                if (!this.textures.exists(fish.key)) {
                    generateFishSprite(this, fish);
                }
                
                const centerX = padding + col * colSpacing + colSpacing / 2;
                const centerY = padding + row * rowSpacing + tankHeight / 2;

                const tank = this.add.rectangle(centerX, centerY, tankWidth, tankHeight, 0x0000ff, 0.3);
                tank.setOrigin(0.5);
                scrollContainer.add(tank);

                const sprite = this.add.image(centerX, centerY, fish.key).setOrigin(0.5);
                const spriteScale = Math.min(tankWidth / sprite.width, tankHeight / sprite.height) * 0.8;
                sprite.setScale(spriteScale);
                scrollContainer.add(sprite);

                const name = fish.name || 'Unnamed';
                const type = fish.fishType || 'Unknown Type';

                const nameText = this.add.text(centerX, centerY + tankHeight / 2 + 4, `${name}\n${type}`, {
                    fontSize: '20px',
                    color: '#ffffff',
                    align: 'center',
                }).setOrigin(0.5, 0);

                scrollContainer.add(nameText);
            });

            // Update scroll boundaries
            const viewportHeight = this.cameras.main.height;
            const contentHeight = (row + 1) * rowSpacing + padding;

            this.minScrollY = Math.min(viewportHeight - contentHeight, 0);
            this.maxScrollY = 0;
            this.scrollContainer.y = 0;

            // --- Scrollbar setup ---

        // Scrollbar background track
        this.scrollContainer.y = 0;
        
        const trackWidth = 20;
        const trackHeight = viewportHeight - 40;  // some padding top and bottom
        const trackX = this.cameras.main.width - trackWidth - 10;
        const trackY = 20;

        this.scrollbarTrack = this.add.rectangle(trackX, trackY, trackWidth, trackHeight, 0x555555).setOrigin(0, 0);

        // Scrollbar thumb (draggable)
        // Thumb height proportional to viewport/content ratio (min 30px)
        const thumbHeight = Math.max((viewportHeight / contentHeight) * trackHeight, 30);
        this.scrollbarThumb = this.add.rectangle(trackX, trackY, trackWidth, thumbHeight, 0xaaaaaa).setOrigin(0, 0).setInteractive();

        // Enable dragging for thumb
        this.input.setDraggable(this.scrollbarThumb);

        this.scrollbarThumb.on('drag', (pointer, dragX, dragY) => {
            // Clamp dragY inside track
            const minY = trackY;
            const maxY = trackY + trackHeight - thumbHeight;
            const newY = Phaser.Math.Clamp(dragY, minY, maxY);

            this.scrollbarThumb.y = newY;

            // Calculate scrollContainer Y based on thumb position
            const scrollPercent = (newY - trackY) / (trackHeight - thumbHeight);
            this.scrollContainer.y = Phaser.Math.Linear(this.maxScrollY, this.minScrollY, scrollPercent);
        });

        // Optional: Clicking track jumps scrollbar thumb
        this.scrollbarTrack.setInteractive();
        this.scrollbarTrack.on('pointerdown', (pointer) => {
            const localY = pointer.y - trackY - this.scrollbarThumb.height / 2;
            const clampedY = Phaser.Math.Clamp(localY, 0, trackHeight - thumbHeight);
            this.scrollbarThumb.y = trackY + clampedY;

            const scrollPercent = clampedY / (trackHeight - thumbHeight);
            this.scrollContainer.y = Phaser.Math.Linear(this.maxScrollY, this.minScrollY, scrollPercent);
        });
        }

        createDropdown() {
            // Dropdown background box
        const dropdownBg = this.add.rectangle(1040, 20, 200, 40, 0x000000, 0.8).setOrigin(0, 0).setInteractive();
        const dropdownText = this.add.text(1050, 30, 'Sort: ID ▼', {
            fontSize: '24px',
            //fontFamily:'MicroFont', 
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Dropdown options
        const options = ['ID', 'Name', 'Fish Type', 'Date'];
        const optionTexts = [];

        let dropdownOpen = false;

        const toggleDropdown = () => {
            dropdownOpen = !dropdownOpen;
            optionTexts.forEach(opt => opt.setVisible(dropdownOpen));
        };

        dropdownBg.on('pointerdown', toggleDropdown);
        dropdownText.on('pointerdown', toggleDropdown);

        // Create option texts (hidden by default)
        options.forEach((label, i) => {
            const opt = this.add.text(1050, 70 + i * 30, label, {
                fontSize: '24px',
                //fontFamily:'MicroFont', 
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 6, y: 2 }
            }).setOrigin(0, 0.5).setVisible(false).setInteractive();

            opt.on('pointerdown', () => {
                this.sortMethod = label.toLowerCase().replace(' ', '_');
                dropdownText.setText(`Sort: ${label} ▼`);
                dropdownOpen = false;
                optionTexts.forEach(o => o.setVisible(false));
                this.renderInventory(); // re-render sorted
            });

            optionTexts.push(opt);
        });
        }

}
