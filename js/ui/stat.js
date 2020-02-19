class Stat extends Phaser.GameObjects.Container {
 
    constructor(scene, player) {
        super(scene);

        this.player = player;

        let ninepatch = new Ninepatch(this.scene, 70, (this.player.maxDelay == 0 ? 80 : 100), "grey");
        this.add(ninepatch);

        let icon = this.scene.add.sprite(0, 0, "tileset:items", 84);
        icon.setOrigin(0, 0);
        icon.x = 10;
        icon.y = 10;
        this.add(icon);

        this.stats = {};

        this.stats['health'] = this.scene.add.bitmapText(0, 0, "font:gui", this.player.health, 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        this.stats['health'].x = icon.x + icon.width + 5;
        this.stats['health'].y = icon.y + (icon.height / 2) - (this.stats['health'].height / 2);
        this.add(this.stats['health']);

        let iconAttack = this.scene.add.sprite(0, 0, "tileset:items", 198);
        iconAttack.setOrigin(0, 0);
        iconAttack.x = icon.x;
        iconAttack.y = icon.y + icon.height + 5;
        this.add(iconAttack);

        this.stats['attack'] = this.scene.add.bitmapText(0, 0, "font:gui", "0", 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        this.stats['attack'].x = iconAttack.x + iconAttack.width + 5;
        this.stats['attack'].y = iconAttack.y + (iconAttack.height / 2) - (this.stats['attack'].height / 2);
        this.add(this.stats['attack']);

        let iconDefense = this.scene.add.sprite(0, 0, "tileset:items", 220);
        iconDefense.setOrigin(0, 0);
        iconDefense.x = iconAttack.x;
        iconDefense.y = iconAttack.y + iconAttack.height + 5;
        this.add(iconDefense);

        this.stats['defense'] = this.scene.add.bitmapText(0, 0, "font:gui", "0", 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        this.stats['defense'].x = iconDefense.x + iconDefense.width + 5;
        this.stats['defense'].y = iconDefense.y + (iconDefense.height / 2) - (this.stats['defense'].height / 2);
        this.add(this.stats['defense']);

        if (this.player.maxDelay > 0) {
            let iconDelay = this.scene.add.sprite(0, 0, "tileset:items", 143);
            iconDelay.setOrigin(0, 0);
            iconDelay.x = iconDefense.x;
            iconDelay.y = iconDefense.y + iconDefense.height + 5;
            this.add(iconDelay);

            this.stats['delay'] = this.scene.add.bitmapText(0, 0, "font:gui", this.player.delay, 10, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
            this.stats['delay'].x = iconDelay.x + iconDelay.width + 5;
            this.stats['delay'].y = iconDelay.y + (iconDelay.height / 2) - (this.stats['delay'].height / 2);
            this.add(this.stats['delay']);
        }
    }

    updateStat(stat, newValue, callback) {
        /* Scale the number */
        this.scene.tweens.add({
            targets: this.stats[stat],
            scaleX: 2,
            scaleY: 2,
            duration: 200,
            ease: "Linear.In",
            callbackScope: this,
            onComplete: function() {

                if (stat != "attack") {
                    /* Animate and increment the new value */
                    this.timer = this.scene.time.addEvent({
                        delay: (100 * 10) / newValue,    // 10 should take 100ms in total
                        callbackScope: this,
                        callback: function() {
                            this.player[stat] += (newValue > 0 ? 1 : -1);
                            this.stats[stat].setText(this.player[stat]);

                            if (callback != undefined && (this.timer.repeatCount == 0 || isNaN(this.timer.repeatCount))) {
                                callback();
                            }
                        },
                        repeat: Math.abs(newValue) - 1
                    });
                } else {
                    this.player[stat] = newValue;
                    this.stats[stat].text = this.player[stat];

                    if (callback != undefined) {
                        callback();
                    }
                }

                /* Scale back */
                this.scene.tweens.add({
                    targets: this.stats[stat],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: "Linear.In"
                });
            }
        });
    }

    updateTurn(callback) {
        if (this.player.maxDelay > 0) {
            this.updateStat("delay", -1, callback);
        }
    }

    isReady() {
        return this.player.delay == 0 && this.player.maxDelay > 0;
    }

    resetDelay() {
        this.updateStat("delay", this.player.maxDelay);
    }
};