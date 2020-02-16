class Player extends Phaser.GameObjects.Container {

    constructor(scene, unitId, health) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.pixelScale = 2;
        this.unitId = unitId;

        this.health = this.maxHealth = health;
        this.attack = this.defense = 0;

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

        this.txt_health = this.scene.add.bitmapText(0, 0, "font:gui", "HP:" + this.health + "/" + this.maxHealth, 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0.5);
        this.txt_health.y = this.background.y + this.background.height + 10;
        this.add(this.txt_health);

        this.txt_attack = this.scene.add.bitmapText(0, 0, "font:gui", "Atk:" + this.attack, 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0.5);
        this.txt_attack.y = this.txt_health.y + this.txt_health.height + 0;
        this.add(this.txt_attack);

        this.txt_defense = this.scene.add.bitmapText(0, 0, "font:gui", "Def:" + this.defense, 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0.5);
        this.txt_defense.y = this.txt_attack.y + this.txt_health.height + 0;
        this.add(this.txt_defense);

        this.direction = -1;
    }

    setAttack(amount) {
        this.attack = amount;
        this.txt_attack.text = "Atk:" + this.attack;
    }

    setDefense(amount) {
        this.defense = amount;
        this.txt_defense.text = "Def:" + this.defense;
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
};