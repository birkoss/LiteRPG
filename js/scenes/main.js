class MainScene extends SceneTransition {
    constructor() {
        super({
            key: 'MainScene'
        });

        this.levelConfig = {ID: "001", data: {health: 100}, index: 1, isLocked: false};
        this.levelConfig.data.health = 100;
    }

    init(config) {
        if (Object.entries(config).length === 0 && config.constructor === Object) {
            return;
        }
        
        this.levelConfig = config;
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#489848");

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

        this.panel = this.add.container();
        this.createPanel();

        this.player = new Player(this, "knight", 100);
        this.player.animate();
        this.player.x = this.player.background.getBounds().width + this.grid.x;
        this.player.y = this.player.background.getBounds().height + this.panel.getBounds().height;
        this.add.existing(this.player);

        this.enemy = new Enemy(this, "skeleton", this.levelConfig.data.health, 10, 4, 3);
        this.enemy.animate();
        this.enemy.x = this.sys.game.canvas.width - this.enemy.background.getBounds().width - this.grid.x;
        this.enemy.y = this.enemy.background.getBounds().height + this.panel.getBounds().height;
        this.add.existing(this.enemy);

        this.createEffects();

        this.addTransition(this.panel, SceneTransition.MOVE_DOWN);
        this.addTransition(this.grid, SceneTransition.MOVE_UP);
        this.addTransition(this.player, SceneTransition.MOVE_LEFT);
        this.addTransition(this.enemy, SceneTransition.MOVE_RIGHT);
        this.startTransition(SceneTransition.IN, function() {
            this.grid.setInteractive(true);
        });
    }

    createPanel() {
        let ninepatch = new Ninepatch(this, this.grid.getBounds().width, 50, "grey");
        ninepatch.x = (this.sys.game.canvas.width - ninepatch.getBounds().width) / 2;;
        ninepatch.y = 10;
        this.panel.add(ninepatch);

        let label = this.add.bitmapText(0, 0, "font:gui", "Choose a level", 20, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        label.tint = 0xdcdcdc;
        label.setOrigin(0, 0.5);
        label.x = ninepatch.x + 12;
        label.y = ninepatch.y + (ninepatch.getBounds().height / 2);
        this.panel.add(label);

        let close = this.add.sprite(10, 10, "ui:close");
        close.x = ninepatch.x + ninepatch.getBounds().width - 30;
        close.y = ((ninepatch.y + ninepatch.getBounds().height) / 2) + 5;
        close.setScale(2);

        close.setInteractive();
        close.on('pointerup', function (pointer) {
            this.showPopup("leave");
        }, this);

        this.panel.add(close);
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

    onPopupButtonClicked(popup_type, button_text, popupConfig) {
        this.scene.resume();

        switch (popup_type) {
            case "leave":
                switch (button_text) {
                    case "Yes":
                        this.startTransition(SceneTransition.OUT, function() {
                            this.scene.start('LevelScene');
                        });
                        break;
                }
                break;
        }
    }
};