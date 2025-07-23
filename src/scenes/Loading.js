import { gameState } from '../constants/gameState.js';
import { auth, db } from '../constants/firebase.js';

// "Every great game begins with a single scene. Let's make this one unforgettable!"
function loadGameState() {
    return new Promise((resolve, reject) => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            console.warn("No authenticated user to load data for.");
            resolve(); // skip load if no user
            return;
        }

        db.collection('saves').doc(uid).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    gameState.xp = data.xp ?? 0;
                    gameState.caughtFish = data.fish ?? [];
                    gameState.fishCounter = data.fishCounter ?? 0;
                    gameState.currentLocationKey = data.currentLocationKey || 'lake';
                    console.log('Loaded gameState:', gameState);
                } else {
                    console.log("No saved game found for user.");
                }
                resolve();
            })
            .catch(error => {
                console.error("Failed to load game state:", error);
                reject(error);
            });
    });
}


export class Loading extends Phaser.Scene {
    constructor() {
        super('Loading');
    }

    init() {
        this.hasLoaded = false;
    }

    preload() {
        // Load assets
    }

    create() {
    this.add.text(640, 50, 'Sign-up or log-in to continue', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

    //email input
    this.add.text(100,100,"Email:").setColor('#ffffff');
    const emailInput = this.add.dom(250,100,'input', {
        type:'email',
        placeholder:'Enter your email',
        fontSize:'16px',
        width:'200px'
    });

    //password input
    this.add.text(100,140,"Password:").setColor('#ffffff');
    const passwordInput = this.add.dom(250,140,'input', {
        type:'password',
        placeholder:'Enter your password',
        fontSize:'16px',
        width:'200px'
    });

    //login button
    const loginButton = this.add.text(250, 190, 'Log In', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    loginButton.on('pointerdown', async () => {
    const email = emailInput.node.value;
    const password = passwordInput.node.value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("Login successful:",userCredential.user.uid);

        await loadGameState();

        this.scene.start('Start');
    } catch(error) {
        console.error("Login failed:",error);
        alert(error.message);
    }
    });

    // Sign Up Button
    const signUpButton = this.add.text(250, 230, 'Sign Up', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    signUpButton.on('pointerdown', async () => {
        const email = emailInput.node.value;
        const password = passwordInput.node.value;

         try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;
            console.log("Sign-up successful:", uid);

            // Optional: Initialize save doc in Firestore
            await db.collection('saves').doc(uid).set({
                xp: 0,
                fish: [],
                fishCounter: 0,
                currentLocationKey: 'lake',
                timestamp: Date.now()
            });

            await loadGameState();
            this.scene.start('Start');
        } catch (error) {
            console.error("Sign-up failed:", error);
            alert(error.message);
        }
        });

        // Dev Log-In Button
        const devLoginButton = this.add.text(250, 270, 'Dev Log-In', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        devLoginButton.on('pointerdown', async () => {
            const devEmail = 'test@example.com';
            const devPassword = 'testtest';

            try {
                const userCredential = await auth.signInWithEmailAndPassword(devEmail, devPassword);
                console.log("Dev login successful:", userCredential.user.uid);

                await loadGameState();
                this.scene.start('Start');
            } catch (error) {
                console.error("Dev login failed:", error);
                alert(error.message);
            }
        });

    }

}
