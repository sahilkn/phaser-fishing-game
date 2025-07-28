import { Boot } from './scenes/Boot.js';
import { Loading } from './scenes/Loading.js';
import { Start } from './scenes/Start.js';
import { Fishing } from './scenes/Fishing.js';
import { Aquarium } from './scenes/Aquarium.js';
import { Inventory } from './scenes/Inventory.js';
import { Profile } from './scenes/Profile.js';
import { Locations } from './scenes/Locations.js';


const config = {
    type: Phaser.AUTO,
    title: 'Fishing Game',
    description: '',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to see collision boxes
        }
    },
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    pixelArt: true,
    scene: [
        Boot,
        Loading,
        Start,
        Fishing,
        Inventory,
        Aquarium,
        Profile,
        Locations
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent:'game-container',
        resizeInterval: 100,
    },
    dom: {
        createContainer:true
    }
}

new Phaser.Game(config);

        