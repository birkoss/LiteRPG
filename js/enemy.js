class Enemy extends Player {

    constructor(scene, unitId, health, attack, defense, delay) {
        super(scene, unitId, health);
        scene.add.existing(this);

        this.delay = this.maxDelay = delay;

        this.setAttack(attack);
        this.setDefense(defense);

        this.face(-1);

        this.txt_delay = this.scene.add.bitmapText(0, 0, "font:gui", "Delai:" + this.delay + "/" + this.maxDelay, 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0.5);
        this.txt_delay.y = this.txt_defense.y + this.txt_health.height + 0;
        this.add(this.txt_delay);
    }

    isReady() {
    	this.delay = Math.max(0, this.delay - 1);

    	return this.delay == 0;
    }

};