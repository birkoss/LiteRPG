class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainScene'
        });
    }

    create() {
        /* Generate units animations */
        let unitsData = this.cache.json.get('data:units');
        unitsData.forEach(single_data => {
            this.anims.create({
                key: single_data.id,
                frames:this.anims.generateFrameNumbers('tileset:units', { frames: single_data.frames }),
                frameRate: 3,
                repeat: -1
            });
        }, this);

        this.inventory = ["shield", "potion", "dagger", "axe"];

        this.grid = new Grid(this, {
            size: 50,           /* Size of each tile */
            rows: 10,            /* Height of the grid */
            cols: 7,        /* Width of the grid */
            destroySpeed: 200,
            fallSpeed: 80,
            minTilesConnected: 3, /* The minimum tiles connected to removed */
            items: this.inventory
        });

        this.add.existing(this.grid);

        this.grid.generate();
        this.grid.show();
        this.grid.on("TILES_REMOVED", this.onGridTilesRemoved, this);
        this.grid.on("INTERACTION_REACTIVATE", this.onGridInteractionReactivated, this);

        this.grid.x = (this.sys.game.canvas.width - this.grid.getBounds().width) / 2;
        this.grid.y = this.sys.game.canvas.height - this.grid.getBounds().height - this.grid.x;

        this.player = new Player(this, "knight", 100);
        this.player.animate();
        this.player.x = this.player.background.getBounds().width;
        this.player.y = this.player.background.getBounds().height;
        this.add.existing(this.player);

        this.enemy = new Enemy(this, "skeleton", 100, 10, 4, 3);
        this.enemy.animate();
        this.enemy.x = this.sys.game.canvas.width - this.enemy.background.getBounds().width;
        this.enemy.y = this.enemy.background.getBounds().height;
        this.add.existing(this.enemy);

        this.grid.setInteractive(true);
    }

    /* Events */

    onGridInteractionReactivated(grid) {
        if (this.enemy.isReady()) {
            /* Prevent the player to select a tile */
            this.grid.setInteractive(false);
        }
    }

    onGridTilesRemoved(grid, totalTiles, item) {

        let amounts = {};

        /* Calculate all amounts from this items */
        this.cache.json.get('data:items').forEach(single_data => {
            if (single_data.id == item.itemID) {
                for (let modifier in single_data.modifiers) {
                    amounts[modifier] = single_data.modifiers[modifier] * (totalTiles - 1);
                }
            }
        }, this);

        if (amounts['atk'] != undefined) {
            this.player.setAttack(amounts['atk']);
        }

        if (amounts['def'] != undefined) {
            this.player.setDefense(amounts['def'] + this.player.defense);
        }

        if (amounts['hp'] != undefined) {
            this.player.heal(amounts['hp']);
        }

        console.log(amounts);
    }
};