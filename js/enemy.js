class Enemy extends Player {

    constructor(scene, unitId, health) {
        super(scene, unitId, health);
        scene.add.existing(this);

        this.face(-1);
    }
};