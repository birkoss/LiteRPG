class LevelScene extends SceneTransition {
    constructor() {
        super({
            key:'LevelScene'
        });
    }
 
    create() {
        this.pages = this.add.container();
        this.navigation = this.add.container();
        this.panel = this.add.container();

        this.createPanel();
        
        this.pageWidth = this.sys.canvas.width;

        /* How much we need to scroll to change the page */
        this.pageThreshold = this.pageWidth / 8;

        this.currentLevel = null;

        let padding = (3 * 100) + (10 * 2);
        let startAtX = (this.pageWidth - padding) / 2;
        let levelsPerPage = 15;

        let levels = this.cache.json.get('data:levels');

        let savegame = this.game.load();
        let isLocked = false;

        let index = 0;
        for (var levelID in levels) {
            this.currentPage = Math.floor(index / levelsPerPage);
            let pageStartAtX = this.currentPage * this.pageWidth;

            let levelConfig = {
                ID: levelID,
                data: levels[levelID],
                index: index + 1,
                isLocked: isLocked
            }

            let level = new Level(this, levelConfig);
            level.on('LEVEL_CLICKED', this.onLevelPressed, this);

            let indexInPage = (index - (this.currentPage * levelsPerPage));

            let y = Math.floor(indexInPage / 3);
            let x = indexInPage - (y * 3);

            level.x = (x * (level.getBounds().width + 10)) + startAtX + pageStartAtX;
            level.y = y * (level.getBounds().height + 10);

            this.pages.add(level);

            /* Check if the current level is locked, to lock the remaining levels */
            if (savegame.levels[levelID] == null || savegame.levels[levelID] == undefined) {
                isLocked = true;
            }

            index++;
        }

        this.pages.y = (this.sys.canvas.height - this.pages.getBounds().height) / 2;

        this.maxPages = this.currentPage + 1;
        this.currentPage = 0;

        /* */
        if (this.maxPages > 1) {
            for (let page=0; page<this.maxPages; page++) {
                let navigation = this.add.sprite(0, 0, "tileset:forest");
                navigation.setOrigin(0);
                navigation.displayWidth = 40;
                navigation.displayHeight = 20;

                navigation.x = (page * (navigation.displayWidth + 10));

                if (page == 0) {
                    navigation.alpha = 0.5;
                }

                navigation.page = page;

                navigation.setInteractive();
                navigation.on('pointerup', function (pointer) {
                    this.currentPage = navigation.page;
                    this.changePage(0)
                }, this);

                this.navigation.add(navigation);
            }

            this.navigation.y = this.sys.game.canvas.height - this.navigation.getBounds().height - 30;
            this.navigation.x = (this.sys.game.canvas.width - this.navigation.getBounds().width) / 2;
        }

        this.addTransition(this.panel, SceneTransition.FALL_DOWN);
        this.addTransition(this.pages, SceneTransition.FALL_DOWN);
        this.addTransition(this.navigation, SceneTransition.FALL_DOWN);
        this.startTransition(SceneTransition.IN);
        console.log("first", this);

        /* Track the startion and last position */
        this.input.on('pointerdown', function (pointer) {
            this.pages.startX = this.pages.x;
            this.pages.lastX = pointer.x;
            this.pages.diff = 0;
        }, this);   

        /* Move the levels container and keep track of the last position */
        this.input.on('pointermove', function (pointer) {
            this.pages.x -= (this.pages.lastX - pointer.x);
            this.pages.lastX = pointer.x;

            /* The difference between the current position and the starting position */
            this.pages.diff = this.pages.x - this.pages.startX;

            if (this.currentLevel != null && (this.pages.diff > this.pageThreshold || this.pages.diff < this.pageThreshold * -1)) {
                this.currentLevel.unselect();
                this.currentLevel = null;
            }

        }, this);  

        /* Animate the levels container depending on the new page */
        this.input.on('pointerup', function (pointer) {
            if (this.currentLevel != null) {
                this.currentLevel.unselect();
            }

            if (this.pages.diff > this.pageThreshold) {
                this.changePage(-1);
            } else if (this.pages.diff < this.pageThreshold * -1) {
                this.changePage(1);
            } else {
                this.changePage(0);
                if (this.currentLevel != null) {
                    if (this.currentLevel.config.isLocked) {
                        this.showPopup("level_locked", {level:this.currentLevel.config});
                    } else {
                        this.showPopup("level_selector", {level:this.currentLevel.config});
                    }
                }
            }

            this.currentLevel = null;
        }, this);   
    }

    createPanel() {
        let ninepatch = new Ninepatch(this, this.sys.canvas.width - 20, 50, "grey");
        ninepatch.x = 10;
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
            this.startTransition(SceneTransition.OUT, function() {
                this.scene.start('SplashScene');
            });
        }, this);

        this.panel.add(close);
    }

    changePage(page) {
        this.currentPage += page;

        if (this.currentPage < 0) {
            this.currentPage = 0;
        }

        if (this.currentPage >= this.maxPages) {
            this.currentPage = this.maxPages - 1;
        }

        this.tweens.add({
            targets: this.pages,
            x: this.currentPage * -this.pageWidth,
            duration: 300,
            ease: "Linear",
            callbackScope: this,
            onComplete: function() {
                this.navigation.getAll().forEach(single_navigation => {
                    single_navigation.alpha = 1;
                });
                if (this.currentPage < this.navigation.getAll().length) {
                    this.navigation.getAt(this.currentPage).alpha = 0.5;
                }
            }
        });
    }

    /* Events */

    onLevelPressed(level) {
        this.currentLevel = level;

        this.currentLevel.select();
    }

    onPopupButtonClicked(popup_type, button_text, popupConfig) {
        this.scene.resume();

        switch (popup_type) {
            case "level_selector":
                switch (button_text) {
                    case "Yes":
                        this.startTransition(SceneTransition.OUT, function() {
                            this.scene.start('MainScene', popupConfig.level);
                        });
                        break;
                }
                break;
        }
    }
};