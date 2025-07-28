// utils/gameState.js

export const gameState = {
    user: 
    {
        uid:null,
        email:null,
        username: null,
    },
    caughtFish: [],
    xp: 0,
    level: 1,
    location: null, // You can use this for tracking fishing location
    fishCounter:0,
    gold:0,

    addFish(fishData) {
        this.caughtFish.push(fishData);
    },
    addXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    },
    checkLevelUp() {
        const requiredXP = this.level * 100;
        while (this.xp >= requiredXP) {
            this.xp -= requiredXP;
            this.level++;
        }
    },
    addGold(amount) {
        this.gold += amount;
    }
};
