class Player extends Phaser.GameObjects.Container {

    constructor(scene, unitId, health) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.pixelScale = 2;
        this.unitId = unitId;

        this.health = this.maxHealth = health;

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

        this.txt_health = this.scene.add.bitmapText(0, 0, "font:gui", this.health + "/" + this.maxHealth, 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0.5);
        this.txt_health.y = this.background.y + this.background.height + 10;
        this.add(this.txt_health);

        this.direction = -1;
    }

    damage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    animate() {
        this.background.anims.play(this.unitId);
    }

    face(newDirection) {
        if (newDirection == this.direction) {
            return;
        }

        this.direction = newDirection;
        this.background.scaleX = (this.direction == -1 ? this.pixelScale : this.pixelScale * -1);
    }

    deactivate() {
        this.background.anims.stop();
    }
};