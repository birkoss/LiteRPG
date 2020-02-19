var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: true,
    roundPixels: true,
    scene: [
        BootScene,
        SplashScene,
        LevelScene,
        MainScene,
    ]
};

var game = new Phaser.Game(config);

game.load = function() {
    let savegame = {
        levels: {},
        player: {
            health: 30,
            items: ["potion", "dagger", "axe", "shield"]
        }
    };


    let levels = JSON.parse(localStorage.getItem('levels'));
    if (levels != null) {
        savegame.levels = levels;
    }
    let player = JSON.parse(localStorage.getItem('player'));
    if (player != null) {
        savegame.player = player;
    }

    return savegame;
}

game.save = function(savegame) {
    if (savegame.levels != null) {
        localStorage.setItem("levels", JSON.stringify(savegame.levels));
    }
    if (savegame.player != null) {
        localStorage.setItem("player", JSON.stringify(savegame.player));
    }
}