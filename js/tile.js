class Tile extends Phaser.GameObjects.Container {

    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.pixelScale = 2;
        this.create();
    }

    create() {
        this.background = this.scene.add.sprite(0, 0, "tileset:tiles");
        this.add(this.background);

        /*
        this.item = this.scene.add.sprite(0, 0, "tileset:items", 2);
        this.item.setScale(this.pixelScale);
        this.add(this.item);
        */
    }

    setValue(new_value) {
        this.background.setFrame(new_value);
    }
};