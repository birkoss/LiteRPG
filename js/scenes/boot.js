class BootScene extends Phaser.Scene {
    constructor() {
        super({
            key:'BootScene'
        });
    }
 
    preload() {
        this.load.spritesheet('tileset:tiles', 'assets/sprites/tiles.png', { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet('tileset:units', 'assets/sprites/units.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('tileset:items', 'assets/sprites/items.png', { frameWidth: 32, frameHeight: 32 });

        this.load.bitmapFont('font:guiOutline', 'assets/fonts/guiOutline.png', 'assets/fonts/guiOutline.xml');
        this.load.bitmapFont('font:gui', 'assets/fonts/gui.png', 'assets/fonts/gui.xml');
        
        this.load.json('data:units', 'assets/units.json');
    }
 
    create() {
        this.scene.start('MainScene');
    }
};