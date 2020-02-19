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
        this.background = new Ninepatch(this.scene, 100, 100, "grey");
        this.background.x = 0;
        this.background.y = 0;
        this.add(this.background);

        this.background.background.setInteractive();
        this.background.background.on('pointerdown', function (pointer) {
            console.log("...");
            this.emit("LEVEL_CLICKED", this);
        }, this);

        this.unselect();

        this.label = this.scene.add.bitmapText(0, 0, "font:gui", this.config.index, 50, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        this.label.setOrigin(0.5, 0.5);
        this.label.x = (this.background.getBounds().width / 2) - 2;
        this.label.y = (this.background.getBounds().height / 2) - 10;
        this.add(this.label);

        let icon = this.scene.add.sprite(0, 0, "tileset:items", 84);
        icon.setOrigin(0, 0);
        icon.setScale(2);
        icon.x = ((this.background.getBounds().width - (icon.width * 2)) / 2) - (icon.width * 2) + 4;
        icon.y = this.background.getBounds().height - (icon.height * 2);
        this.add(icon);

        let health = this.scene.add.bitmapText(0, 0, "font:gui", this.config.data.health, 20, Phaser.GameObjects.BitmapText.ALIGN_LEFT);
        health.setOrigin(0, 0);
        health.x = icon.x + (icon.width * 2) + 4;
        health.y = (this.background.getBounds().height - (icon.height * 2)) + 4;
        this.add(health);


        if (this.config.isLocked) {
            this.alpha = 0.5;
        }
    }
};