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

        this.createEffects();

        this.grid.setInteractive(true);
    }

    createEffects() {
        this.effects = {};

        this.anims.create({
            key: "attack",
            frames: [{
                frame: 10,
                key: "tileset:effectsLarge"
            },{
                frame: 11,
                key: "tileset:effectsLarge"
            }],
            frameRate: 20,
            yoyo: true,
            repeat: 2
        });
        this.effects['defense'] = this.add.sprite(this.player.x, this.player.y, "tileset:effectsSmall");
        this.effects['defense'].setScale(1);
        this.effects['defense'].alpha = 0;
        this.effects['defense'].on("animationcomplete", function(tween, sprite, element) {
            element.alpha = 0;
        }, this);

        this.anims.create({
            key: "defense",
            frames: [{
                frame: 64,
                key: "tileset:effectsSmall"
            },{
                frame: 65,
                key: "tileset:effectsSmall"
            },{
                frame: 66,
                key: "tileset:effectsSmall"
            }],
            frameRate: 8,
            yoyo: true,
            repeat: 2
        });
        this.effects['attack'] = this.add.sprite(this.enemy.x, this.enemy.y, "tileset:effectsLarge");
        this.effects['attack'].setScale(1);
        this.effects['attack'].alpha = 0;
        this.effects['attack'].on("animationcomplete", function(tween, sprite, element) {
            element.alpha = 0;
        }, this);
    }

    showEffect(name) {
        if (this.effects[name] != undefined) {
            this.effects[name].alpha = 1;
            this.effects[name].anims.play(name, true);
        }
    }

    /* Events */

    onGridInteractionReactivated(grid) {
        if (!this.player.isAlive()) {
            alert("Player is dead!");
            return;
        }

        if (!this.enemy.isAlive()) {
            alert("Enemy is dead!");
            return;
        }

        /* The enemy is not ready to attack */
        if (!this.enemy.isReady()) {
            return;
        }
            
        /* Prevent the player to select a tile */
        this.grid.setInteractive(false);

        this.enemy.reset();

        let damage = 0;

        if (this.player.defense >= this.enemy.attack) {
            this.player.setDefense(this.player.defense - this.enemy.attack);
        } else {
            damage = Math.max(0, this.enemy.attack - this.player.defense);
            this.player.setDefense(0)
        }

        if (damage == 0) {
            this.showEffect("defense");
        } else {
            this.player.damage(damage);

            /* Shake the screen and flash red */
            this.cameras.main.shake(500);
            this.cameras.main.flash(500, 255, 0, 0);
        }

        this.grid.setInteractive(true);
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

            this.enemy.damage(amounts['atk']);

            this.showEffect("attack");
        }

        if (amounts['def'] != undefined) {
            this.player.setDefense(amounts['def'] + this.player.defense);
        }

        if (amounts['hp'] != undefined) {
            this.player.heal(amounts['hp']);
        }
    }
};