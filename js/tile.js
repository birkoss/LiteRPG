class Tile extends Phaser.GameObjects.Container {

    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.create();
    }

    create() {
        this.background = this.scene.add.sprite(0, 0, "tileset:tiles");
        this.add(this.background);

        this.item = this.scene.add.sprite(0, 0, "tileset:items", 1);
        this.item.setScale(2);
        this.add(this.item);
    }

    setItem(new_item) {
        this.background.setFrame(new_item.slot);

        this.scene.cache.json.get('data:items').forEach(single_data => {
            if (single_data.id == new_item.itemID) {
                this.item.setFrame(single_data.frame);
            }
        }, this);
    }
};