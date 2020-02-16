class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainScene'
        });
    }

    create() {
        this.grid = new Grid(this, {
            size: 50,           /* Size of each tile */
            rows: 10,            /* Height of the grid */
            cols: 7,        /* Width of the grid */
            items: 4,          /* Number of different tiles */
            destroySpeed: 200,
            fallSpeed: 80,
            minTilesConnected: 3 /* The minimum tiles connected to removed */
        });

        let unitsData = this.cache.json.get('data:units');
        unitsData.forEach(single_data => {
            this.anims.create({
                key: single_data.id,
                frames:this.anims.generateFrameNumbers('tileset:units', { frames: single_data.frames }),
                frameRate: 3,
                repeat: -1
            });
        }, this);

        this.add.existing(this.grid);

        this.grid.generate();

        this.grid.show();

        this.player = new Player(this, "knight", 100);
        this.player.animate();
        this.player.x = this.player.background.getBounds().width;
        this.player.y = this.player.background.getBounds().height;
        this.add.existing(this.player);

        this.enemy = new Enemy(this, "skeleton", 100);
        this.enemy.animate();
        this.enemy.x = this.sys.game.canvas.width - this.enemy.background.getBounds().width;
        this.enemy.y = this.enemy.background.getBounds().height;
        this.add.existing(this.enemy);
    }
};