class Ninepatch extends Phaser.GameObjects.Container {

    constructor(scene, wantedWidth, wantedHeight, spriteSheet) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.spriteSheet = spriteSheet;
        this.wantedWidth = wantedWidth;
        this.wantedHeight = wantedHeight;

        this.create();
    }

    create() {
        let cornerTL = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 0);
        cornerTL.setOrigin(0);
        this.add(cornerTL);

        let top = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 1);
        top.setOrigin(0);
        top.x = cornerTL.width;
        top.displayWidth = this.wantedWidth - (cornerTL.width * 2);
        this.add(top);

        let cornerTR = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 2);
        cornerTR.setOrigin(0);
        cornerTR.x = top.x + top.displayWidth;
        this.add(cornerTR);

        let left = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 3);
        left.setOrigin(0);
        left.y = cornerTL.height;
        left.displayHeight = this.wantedHeight - (cornerTL.height * 2);
        this.add(left);

        let middle = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 4);
        middle.setOrigin(0);
        middle.y = cornerTL.height;
        middle.x = cornerTL.width;
        middle.displayHeight = this.wantedHeight - (cornerTL.height * 2);
        middle.displayWidth = this.wantedWidth - (cornerTL.width * 2);
        this.add(middle);

        let right = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 5);
        right.setOrigin(0);
        right.x = cornerTR.x;
        right.y = cornerTL.height;
        right.displayHeight = this.wantedHeight - (cornerTL.height * 2);
        this.add(right);

        let cornerBL = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 6);
        cornerBL.setOrigin(0);
        cornerBL.y = middle.y + middle.displayHeight;
        this.add(cornerBL);

        let bottom = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 7);
        bottom.setOrigin(0);
        bottom.x = cornerBL.width;
        bottom.y = cornerBL.y;
        bottom.displayWidth = this.wantedWidth - (cornerTL.width * 2);
        this.add(bottom);

        let cornerBR = this.scene.add.sprite(0, 0, "ui:ninepatch-" + this.spriteSheet, 8);
        cornerBR.setOrigin(0);
        cornerBR.y = middle.y + middle.displayHeight;
        cornerBR.x = top.x + top.displayWidth;
        this.add(cornerBR);
    }
};