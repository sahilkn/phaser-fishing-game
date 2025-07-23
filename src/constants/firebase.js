export const auth = firebase.auth();
export const db = firebase.firestore();

// Automatically sign in the player anonymously
//auth.signInAnonymously().catch(console.error);

//testing hardcoded login
// auth.signInWithEmailAndPassword('test@example.com', 'testtest')
//   .then(() => console.log('Logged in as test user'))
//   .catch(error => console.error('Login failed:', error));