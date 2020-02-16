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

        this.item = this.scene.add.sprite(0, 0, "tileset:items", 1);
        //this.item.setScale(this.pixelScale);
        this.add(this.item);
    }

    setValue(new_value) {
        this.background.setFrame(new_value);

        switch (new_value) {
            case 1:     // Potion
                this.item.setFrame(2);
                break;
            case 2:     // Shield
                this.item.setFrame(220);
                break;
            case 3:     // Weapon #1
                this.item.setFrame(198);
                break;
            case 0:     // Weapon #2
                this.item.setFrame(168);
                break;

        }
    }
};