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
                    // Safely preserve the structure
                    gameState.user.uid = uid;
                    gameState.user.email = auth.currentUser?.email || null;
                    gameState.user.username = data.user?.username || gameState.user.username;

                    gameState.xp = data.xp ?? 0;
                    gameState.level = data.level ?? 1;
                    gameState.caughtFish = data.fish ?? [];
                    gameState.fishCounter = data.fishCounter ?? 0;
                    gameState.currentLocationKey = data.currentLocationKey || 'lake';
                    gameState.gold = data.gold ?? 0;
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
            color: '#ffffff',
            //fontFamily:'MicroFont',
        }).setOrigin(0.5);

    //email input
    this.add.text(100,100,"Email:",{
        //fontFamily:'MicroFont',
        }).setColor('#ffffff');
    const emailInput = this.add.dom(250,100,'input', {
        type:'email',
        placeholder:'Enter your email',
        fontSize:'16px',
        //fontFamily:'MicroFont',
        width:'200px'
    });

    //password input
    this.add.text(100,140,"Password:", {
        //fontFamily:'MicroFont',
        }).setColor('#ffffff');

    const passwordInput = this.add.dom(250,140,'input', {
        type:'password',
        placeholder:'Enter your password',
        fontSize:'16px',
        //fontFamily:'MicroFont',
        width:'200px'
    });

    //login button
    const loginButton = this.add.text(250, 190, 'Log In', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        //fontFamily:'MicroFont',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    loginButton.on('pointerdown', async () => {
    const email = emailInput.node.value;
    const password = passwordInput.node.value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        gameState.user = {
            uid: user.uid,
            email: user.email,
            username: user.username
        };

        await loadGameState();
        console.log("Login successful:", gameState.user);

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
        //fontFamily:'MicroFont',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    signUpButton.on('pointerdown', async () => {
        const email = emailInput.node.value;
        const password = passwordInput.node.value;

         try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;
            const user = userCredential.user;
            gameState.user = {
                uid: user.uid,
                email: user.email,
                username: null, //temp null until set
            };

            // Disable the main inputs and buttons
            emailInput.node.disabled = true;
            passwordInput.node.disabled = true;
            loginButton.disableInteractive();
            signUpButton.disableInteractive();
            devLoginButton.disableInteractive();

            // Create overlay background (semi-transparent black)
            const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setDepth(10);

            // Create modal background box
            const modal = this.add.rectangle(640, 360, 400, 200, 0x222222, 1).setDepth(11).setStrokeStyle(2, 0xffffff);

            // Add modal prompt text
            const promptText = this.add.text(640, 300, "Enter your username:", {
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(11);

            // Create DOM input for username
            const usernameInput = this.add.dom(640, 360, 'input', {
                type: 'text',
                fontSize: '20px',
                padding: '8px',
                width: '280px'
            }).setDepth(11);

            // Create submit button
            const submitBtn = this.add.text(640, 410, 'Submit', {
                fontSize: '22px',
                backgroundColor: '#008800',
                color: '#ffffff',
                padding: { x: 20, y: 10 },
                align: 'center',
            }).setOrigin(0.5).setDepth(11).setInteractive();

            submitBtn.on('pointerdown', async () => {
                let username = usernameInput.node.value.trim();
                if (username.length === 0) {
                    // Optional: Add a little shake or message
                    promptText.setText("Username can't be empty!");
                    return;
                }

            // Save initial user data with username to Firestore
            await db.collection('saves').doc(uid).set({
                xp: 0,
                fish: [],
                fishCounter: 0,
                currentLocationKey: 'lake',
                username: username,
                timestamp: Date.now()
            });

            gameState.user.username = username;

            console.log("Sign-up successful:", uid);

            // Clean up modal elements
            overlay.destroy();
            modal.destroy();
            promptText.destroy();
            usernameInput.destroy();
            submitBtn.destroy();

            // Re-enable main UI inputs/buttons
            emailInput.node.disabled = false;
            passwordInput.node.disabled = false;
            loginButton.setInteractive();
            signUpButton.setInteractive();
            devLoginButton.setInteractive();

            // Now load saved state and start scene
            await loadGameState();
            this.scene.start('Start');
            });
        } catch (error) {
            console.error("Sign-up failed:", error);
            alert(error.message);

            // Re-enable inputs in case of failure
            emailInput.node.disabled = false;
            passwordInput.node.disabled = false;
            loginButton.setInteractive();
            signUpButton.setInteractive();
            devLoginButton.setInteractive();
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
                const user = userCredential.user;
                gameState.user = {
                    uid: user.uid,
                    email: user.email,
                    username: null
                };

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