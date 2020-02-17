class SplashScene extends Phaser.Scene {
    constructor() {
        super({
            key:'SplashScene'
        });
    }
 
    create() {
        console.log("...");
        let button = new CustomButton(this, "Play", "play_game");
        button.x = 100;
        button.y = 100;
        button.on("BUTTON_CLICKED", this.onButtonClicked, this);
        this.add.existing(button);
    }

    onButtonClicked(button) {
        switch(button.getType()) {
            case "play_game":
                this.scene.start('LevelScene');
                break;
        }
    }
};