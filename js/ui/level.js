class Level extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.config = config;

        this.create();
    }

    select() {
        this.background.alpha = 0.4;
    }

    unselect() {
        this.background.alpha = 1;
    }

    create() {
        this.background = this.scene.add.sprite(0, 0, "tileset:forest");
        this.background.setOrigin(0);
        this.background.displayWidth = 100;
        this.background.displayHeight = 100;
        this.add(this.background);

        this.background.setInteractive();
        this.background.on('pointerdown', function (pointer) {
            this.emit("LEVEL_CLICKED", this);
        }, this);

        this.unselect();

        this.label = this.scene.add.bitmapText(0, 0, "font:gui", this.config.index, 50, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        this.label.setOrigin(0.5, 0.5);
        this.label.x = (this.background.displayWidth / 2) - 2;
        this.label.y = (this.background.displayHeight / 2) - 10;
        this.add(this.label);

        let icon = this.scene.add.sprite(0, 0, "tileset:items", 84);
        icon.setOrigin(0, 0);
        icon.x = ((this.background.displayWidth - icon.width) / 2) - icon.width + 4;
        icon.y = this.background.displayHeight - icon.height;
        this.add(icon);

        let health = this.scene.add.bitmapText(0, 0, "font:gui", this.config.data.health, 20, Phaser.GameObjects.BitmapText.ALIGN_LEFT);
        health.setOrigin(0, 0);
        health.x = icon.x + icon.width + 4;
        health.y = (this.background.displayHeight - icon.height) + 4;
        this.add(health);


        if (this.config.isLocked) {
            this.alpha = 0.5;
        }
    }
};