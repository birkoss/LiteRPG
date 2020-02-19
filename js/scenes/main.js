class MainScene extends SceneTransition {
    constructor() {
        super({
            key: 'MainScene'
        });

        this.levelConfig = {ID: "001", data: {health: 40}, index: 1, isLocked: false};
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

        this.players = {};
        this.players['player'] = new Player(this, "knight", 100);
        this.players['player'].animate();
        this.players['player'].x = this.players['player'].background.getBounds().width + this.grid.x + 80;
        this.players['player'].y = this.players['player'].background.getBounds().height + this.panel.getBounds().height;
        this.add.existing(this.players['player']);

        this.players['enemy'] = new Player(this, "skeleton", this.levelConfig.data.health, 1);
        this.players['enemy'].face(-1);
        this.players['enemy'].animate();
        this.players['enemy'].x = this.sys.game.canvas.width - this.players['enemy'].background.getBounds().width - this.grid.x - 70;
        this.players['enemy'].y = this.players['enemy'].background.getBounds().height + this.panel.getBounds().height;
        this.add.existing(this.players['enemy']);

        this.stats = {};
        this.stats['player'] = new Stat(this, this.players['player']);
        this.stats['player'].x = this.panel.x;
        this.stats['player'].y = this.panel.y + this.panel.getBounds().height + this.panel.y;
        this.add.existing(this.stats['player']);

        this.stats['enemy'] = new Stat(this, this.players['enemy']);
        this.stats['enemy'].x = this.panel.x + 300;
        this.stats['enemy'].y = this.panel.y + this.panel.getBounds().height + this.panel.y;
        this.stats['enemy'].updateStat("attack", 10);
        this.stats['enemy'].updateStat("defense", 3);
        this.add.existing(this.stats['enemy']);

        this.createEffects();

        this.addTransition(this.panel, SceneTransition.MOVE_DOWN);
        this.addTransition(this.grid, SceneTransition.MOVE_UP);
        this.addTransition(this.players['player'], SceneTransition.MOVE_LEFT);
        this.addTransition(this.players['enemy'], SceneTransition.MOVE_RIGHT);
        this.startTransition(SceneTransition.IN, function() {
            this.grid.setInteractive(true);
        });
    }

    createPanel() {
        let ninepatch = new Ninepatch(this, this.grid.getBounds().width, 50, "grey");
        ninepatch.x = 0;
        ninepatch.y = 0;
        this.panel.add(ninepatch);

        let label = this.add.bitmapText(0, 0, "font:gui", "Choose a level", 20, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        label.tint = 0xdcdcdc;
        label.setOrigin(0, 0.5);
        label.x = ninepatch.x + 12;
        label.y = ninepatch.y + (ninepatch.getBounds().height / 2);
        this.panel.add(label);

        let close = this.add.sprite(10, 10, "ui:close");
        close.x = ninepatch.x + ninepatch.getBounds().width - 30;
        close.y = ((ninepatch.y + ninepatch.getBounds().height) / 2);
        close.setScale(2);

        close.setInteractive();
        close.on('pointerup', function (pointer) {
            this.showPopup("leave");
        }, this);

        this.panel.add(close);

        this.panel.x = (this.sys.game.canvas.width - this.panel.getBounds().width) / 2;
        this.panel.y = 10;
    }

    createEffects() {
        this.effects = {
            "label": this.add.bitmapText(10, 10, "font:gui-outline", "100", 20, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0.5)
        };

        this.effects['label'].alpha = 0;

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
        this.effects['defense'] = this.add.sprite(this.players['player'].x, this.players['player'].y, "tileset:effectsSmall");
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
        this.effects['attack'] = this.add.sprite(this.players['enemy'].x, this.players['enemy'].y, "tileset:effectsLarge");
        this.effects['attack'].setScale(1);
        this.effects['attack'].alpha = 0;
        this.effects['attack'].on("animationcomplete", function(tween, sprite, element) {
            element.alpha = 0;
        }, this);
    }

    showEffect(name, x, y) {
        if (this.effects[name] != undefined) {
            if (x != undefined) {
                this.effects[name].x = x;
            }
            if (y != undefined) {
                this.effects[name].y = y;
            }
            this.effects[name].alpha = 1;
            this.effects[name].anims.play(name, true);
        }
    }

    showLabel(x, y, stat, value, callback) {
        this.effects['label'].x = this.grid.x + x - 2;
        this.effects['label'].y = this.grid.y + y;
        this.effects['label'].text = value;
        this.effects['label'].alpha = 1;

        let destX = this.stats['player'].x + this.stats['player'].stats[stat].x + (this.stats['player'].stats[stat].width / 2);
        let destY = this.stats['player'].y + this.stats['player'].stats[stat].y + (this.stats['player'].stats[stat].height / 2);

        /* Dynamic duration depending on the distance */
        let distance = Phaser.Math.Distance.Between(this.effects['label'].x, this.effects['label'].y, destX, destY);
        let duration = 800 * distance / 600;

        this.tweens.add({
            targets: this.effects['label'],
            x: destX,
            y: destY,
            duration: duration,
            ease: "Exponential.In",
            callbackScope: this,
            onComplete: function() {
                this.effects['label'].alpha = 0;
                this.stats['player'].updateStat(stat, value, callback);
            }
        });
    }

    attack(attacker, defender, callback) {
        let originalX = this.players[attacker].x;

        let damage = Math.max(0, this.players[attacker].attack - this.players[defender].defense);

        this.tweens.add({
            targets: this.players[attacker],
            x: this.players[defender].x,
            duration: 180,
            ease: "Exponential.In",
            callbackScope: this,
            onComplete: function() {

                if (damage > 0) {
                    this.showEffect("attack", this.players[defender].x, this.players[defender].y);

                    this.stats[defender].updateStat("health", -damage);
                    if (attacker == "enemy" && this.players[defender].defense > 0) {
                        /* If the enemy attack the player, empty player's defense */
                        this.stats[defender].updateStat("defense", -this.players[defender].defense);
                    }

                    if (attacker == "enemy") {
                        /* Shake the screen and flash red */
                        this.cameras.main.shake(500);
                        this.cameras.main.flash(500, 255, 0, 0);
                    }
                } else {
                    if (attacker == "enemy") {
                        /* Remove the player's defense depending on the enemy's attack */
                        this.stats[defender].updateStat("defense", -Math.min(this.players[attacker].attack, this.players[defender].defense));
                    }
                    this.showEffect("defense", this.players[defender].x, this.players[defender].y);
                }

                this.tweens.add({
                    targets: this.players[attacker],
                    x: originalX,
                    duration: 180,
                    ease: "Exponential.In",
                    callbackScope: this,
                    onComplete: function() {
                        if (callback != undefined) {
                            callback();
                        }
                    }
                });
            }
        });
    }

    endPlayerTurn() {
        /* Active effects like poison */
        this.stats['player'].updateTurn();

        if (!this.players['enemy'].isAlive()) {
            alert("Enemy is dead!");
            return;
        }

        /* Active effects like poison */
        this.stats['enemy'].updateTurn(function() {
            /* The enemy is not ready to attack */
            if (this.stats['enemy'].isReady()) {
                this.attack("enemy", "player", function() {
                    this.stats['enemy'].resetDelay();
                    this.endEnemyTurn();
                }.bind(this));
            } else {
                this.endEnemyTurn();
            }
        }.bind(this));
    }

    endEnemyTurn() {
        if (!this.players['player'].isAlive()) {
            alert("Player is dead!");
            return;
        }

        this.grid.makeTilesFall();
    }

    /* Events */

    onGridInteractionReactivated(grid) {
        return; // @TODO : Remove completely

        if (!this.players['player'].isAlive()) {
            alert("Player is dead!");
            return;
        }


        this.stats['enemy'].updateTurn();

        /* The enemy is not ready to attack */
        if (!this.stats['enemy'].isReady()) {
            return;
        }
            
        /* Prevent the player to select a tile */
        this.grid.setInteractive(false);

        this.players['enemy'].reset();

        let damage = 0;

        if (this.players['player'].defense >= this.players['enemy'].attack) {
            this.players['player'].setDefense(this.players['player'].defense - this.players['enemy'].attack);
        } else {
            damage = Math.max(0, this.players['enemy'].attack - this.players['player'].defense);
            this.players['player'].setDefense(0)
        }

        if (damage == 0) {
            this.showEffect("defense");
        } else {
            this.players['player'].damage(damage);

            /* Shake the screen and flash red */
            this.cameras.main.shake(500);
            this.cameras.main.flash(500, 255, 0, 0);
        }

        this.grid.setInteractive(true);
    }

    onGridTilesRemoved(grid, totalTiles, item, tile) {
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
            this.showLabel(tile.x, tile.y, "attack", amounts['atk'], function() {
                this.attack("player", "enemy", function() {
                    this.endPlayerTurn();
                }.bind(this));
            }.bind(this));
        }

        if (amounts['def'] != undefined) {
            this.showLabel(tile.x, tile.y, "defense", amounts['def'], function() {
                this.endPlayerTurn();
            }.bind(this));
        }

        if (amounts['hp'] != undefined) {
            this.showLabel(tile.x, tile.y, "health", amounts['hp'], function() {
                this.endPlayerTurn();
            }.bind(this));
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