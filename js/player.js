class Player extends Phaser.GameObjects.Container {

    constructor(scene, unitId, health, delay) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.pixelScale = 2;
        this.unitId = unitId;

        this.health = this.maxHealth = health;
        this.attack = this.defense = 0;
        this.delay = this.maxDelay = (delay != undefined ? delay : 0);

        this.create();

        this.face(1);
    }

    create() {
        this.unitData = {};

        let unitsData = this.scene.cache.json.get('data:units');
        unitsData.forEach(single_data => {
            if (single_data.id == this.unitId) {
                this.unitData = single_data;
            }
        }, this);

        this.background = this.scene.add.sprite(0, 0, "tileset:units", this.unitData.frames[0]);
        this.background.setScale(this.pixelScale);
        this.add(this.background);

        this.direction = -1;
    }

    setAttack(amount) {
        this.attack = amount;
    }

    setDefense(amount) {
        this.defense = amount;
    }


    damage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    animate() {
        this.background.anims.play(this.unitId);
    }

    isAlive() {
        return this.health > 0;
    }

    face(newDirection) {
        if (newDirection == this.direction) {
            return;
        }

        this.direction = newDirection;
        this.background.scaleX = (this.direction == -1 ? this.pixelScale : this.pixelScale * -1);
    }
};