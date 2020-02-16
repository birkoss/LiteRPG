class LevelScene extends Phaser.Scene {
    constructor() {
        super({
            key:'LevelScene'
        });
    }
 
    create() {
        this.pages = this.add.container();
        
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

        console.log(savegame);

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

        });
    }

    showPopup(popup_type, popup_config) {
        this.scene.pause();

        let popup = new PopupScene(popup_type, popup_config);
        popup.setEvent(this.onPopupButtonClicked, this);
        
        this.scene.add("popup_" + popup_type, popup, true);
    }

    onLevelPressed(level) {
        this.currentLevel = level;

        this.currentLevel.select();
    }

    onPopupButtonClicked(popup_type, button_text, popupConfig) {
        switch (popup_type) {
            case "level_selector":
                switch (button_text) {
                    case "Oui":
                        this.scene.start('MainScene', popupConfig.level);
                        break;
                    case "Non":
                        this.scene.resume();
                        break;
                }
                break;
            case "level_locked":
                this.scene.resume();
                break;
        }
    }

};