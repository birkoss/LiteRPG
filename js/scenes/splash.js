class SplashScene extends SceneTransition {
    constructor() {
        super({
            key:'SplashScene'
        });
    }
 
    create() {
        let button = new CustomButton(this, "Play", "play_game");
        button.x = 100;
        button.y = 100;
        button.on("BUTTON_CLICKED", this.onButtonClicked, this);
        this.add.existing(button);


        this.addTransition(button, SceneTransition.FALL_DOWN);
        this.startTransition(SceneTransition.IN);
    }

    /* Events */

    onButtonClicked(button) {
        switch(button.getType()) {
            case "play_game":
                this.startTransition(SceneTransition.OUT, function() {
                    this.scene.start('LevelScene');
                });
                break;
        }
    }
};