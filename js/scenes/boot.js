class BootScene extends Phaser.Scene {
    constructor() {
        super({
            key:'BootScene'
        });
    }
 
    preload() {
        this.load.spritesheet('tileset:tiles', 'assets/sprites/tiles.png', { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet('tileset:units', 'assets/sprites/units.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('tileset:items', 'assets/sprites/items.png', { frameWidth: 16, frameHeight: 16 });

        this.load.bitmapFont('font:gui-outline', 'assets/fonts/guiOutline.png', 'assets/fonts/guiOutline.xml');
        this.load.bitmapFont('font:gui', 'assets/fonts/gui.png', 'assets/fonts/gui.xml');
        
        this.load.spritesheet('ui:long_buttons', 'assets/ui/long_buttons.png', { frameWidth: 190, frameHeight: 49 });
        this.load.spritesheet('ui:ninepatch-grey', 'assets/ui/ninepatch/grey.png', { frameWidth: 16, frameHeight: 16 });

        this.load.image('blank', 'assets/blank.png');

        this.load.image('popup:background', 'assets/ui/popup_background.png');
        this.load.image('popup:inside_small', 'assets/ui/popup_inside_small.png');
        this.load.image('popup:inside_medium', 'assets/ui/popup_inside_medium.png');
        this.load.image('popup:inside_large', 'assets/ui/popup_inside_large.png');
        
        this.load.image('ui:close', 'assets/ui/close.png');

        this.load.spritesheet('tileset:effectsSmall', 'assets/sprites/effectsSmall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('tileset:effectsLarge', 'assets/sprites/effectsLarge.png', { frameWidth: 64, frameHeight: 64 });

        this.load.json('data:units', 'assets/units.json');
        this.load.json('data:items', 'assets/items.json');
        this.load.json('data:levels', 'assets/levels.json');
    }
 
    create() {
        //this.scene.start('SplashScene');
        this.scene.start('MainScene');
        //this.scene.start('LevelScene');
    }
};