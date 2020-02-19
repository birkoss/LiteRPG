class Grid extends Phaser.GameObjects.Container {
    constructor(scene, config) {
        super(scene);
        scene.add.existing(this);

        this.config = config;

        this.tiles = [];
        this.pool = [];        /* To reuse removed tiles sprite */

        this.isInteractive = false;

        this.scene.input.on("pointerdown", this.onTileSelected, this);
    }

    /* Generate the default grid */
    generate() {
        for (let y=0; y<this.config.rows; y++) {
            this.tiles[y] = [];

            for (let x=0; x<this.config.cols; x++) {
                this.tiles[y][x] = {
                    item: this.pickItems(),
                    isEmpty: false,
                    row: y,
                    col: x,
                    tile: null
                };
            }
        }
    }

    /* Show the current grid */
    show() {
        for (let row=0; row<this.config.rows; row++) {
            for (let col=0; col<this.config.cols; col++) {
                let tile = new Tile(this.scene);
                tile.x = (this.config.size * col) + (this.config.size / 2);
                tile.y = (this.config.size * row) + (this.config.size / 2);
                tile.setItem(this.getItemAt(row, col));
                this.add(tile);

                this.setTile(row, col, tile);
            }
        }
    }

    pickItems() {
        let index = Phaser.Math.RND.between(0, this.config.items.length - 1);
        return {
            slot: index,
            itemID: this.config.items[index]
        };
    }

    /* Allow to change the grid interactive state (Can we select a tile to remove it) */
    setInteractive(state) {
        this.isInteractive = state;
    }

    /* Return the amount of spaces below this position */
    getEmptySpacesBelow(row, col) {
        let spaces = 0;

        if (row != this.config.rows) {
            for (let r=row+1; r<this.config.rows; r++) {
                if (this.isEmptyAt(r, col)) {
                    spaces++;
                }
            }
        }

        return spaces;
    }

    /* Swap two tiles in the main array */
    swapTiles(row1, col1, row2, col2) {
        let tile = Object.assign(this.tiles[row1][col1]);

        this.tiles[row1][col1] = Object.assign(this.tiles[row2][col2]);
        this.tiles[row2][col1] = Object.assign(tile);
    }

    /* Get the tiles new position after the felt */
    getFallingTilesMovements() {
        let movements = [];

        /* -2 because the last row can't fall */
        for(let row=this.config.rows-2; row >= 0; row--) {
            for(let col=0; col<this.config.cols; col++) {
                let emptySpaces = this.getEmptySpacesBelow(row, col);
                if (!this.isEmptyAt(row, col) && emptySpaces > 0) {
                    /* Swap this tile to its new destination */
                    this.swapTiles(row, col, row + emptySpaces, col);

                    movements.push({
                        row: row + emptySpaces,
                        col: col,
                        deltaRow: emptySpaces
                    });
                }
            }
        }

        return movements;
    }

    /* Pick new items for the new tiles */
    getNewTilesMovements() {
        let movements = [];

        for (let i=0; i<this.config.cols; i++) {
            if (this.isEmptyAt(0, i)) {
                let emptySpaces = this.getEmptySpacesBelow(0, i) + 1;
                for (let j=0; j<emptySpaces; j++) {
                    movements.push({
                        row: j,
                        col: i,
                        deltaRow: emptySpaces
                    });

                    this.tiles[j][i].item = this.pickItems();
                    this.tiles[j][i].isEmpty = false;
                }
            }
        }

        return movements;
    }

    /* Make existing and new tiles fall into place, and allow the interaction when it's done */
    makeTilesFall() {
        let fallingTiles = 0;

        let fallMovements = this.getFallingTilesMovements();
        let newMovements = this.getNewTilesMovements();

        fallMovements.forEach(function(movement) {
            fallingTiles++;

            this.scene.tweens.add({
                targets: this.tiles[movement.row][movement.col].tile,
                y: this.tiles[movement.row][movement.col].tile.y + this.config.size * movement.deltaRow,
                duration: this.config.fallSpeed * movement.deltaRow,
                callbackScope: this,
                onComplete: function() {
                    fallingTiles--;
                    if (fallingTiles == 0) {
                        this.resetInteraction();
                    }
                }
            });
        }, this);

        newMovements.forEach(function(movement) {
            fallingTiles ++;

            let tile = this.pool.pop();
            tile.alpha = 1;
            tile.y = this.config.size * (movement.row - movement.deltaRow + 1) - this.config.size / 2;
            tile.x = this.config.size * movement.col + this.config.size / 2;
            
            tile.setItem(this.getItemAt(movement.row, movement.col));
            this.setTile(movement.row, movement.col, tile);

            this.scene.tweens.add({
                targets: tile,
                y: this.config.size * movement.row + this.config.size / 2,
                duration: this.config.fallSpeed * movement.deltaRow,
                callbackScope: this,
                onComplete: function() {
                    fallingTiles--;

                    if (fallingTiles == 0) {
                        this.resetInteraction();
                    }
                }
            });
        }, this);
    }

    /* Mark the removed tiles as empty (to allow the falling process) */
    removeConnectedTiles(row, col) {
        let tiles = this.getConnectedTiles(row, col);

        tiles.forEach(function(tile) {
            this.tiles[tile.row][tile.col].isEmpty = true;
        }, this);
    }

    /* Return if this tile is within boundaries and is valid */
    isValidTile(row, col) {
        return row >= 0 && row < this.config.rows && col >= 0 && col < this.config.cols && this.tiles[row] != undefined && this.tiles[row][col] != undefined;
    }

    /* Return if this tile is empty */
    isEmptyAt(row, col) {
        if (!this.isValidTile(row, col)) {
            return false;
        }

        return this.tiles[row][col].isEmpty;
    }

    /* Return the item of this tile if it's valid */
    getItemAt(row, col) {
        if (!this.isValidTile(row, col)) {
            return false;
        }

        return this.tiles[row][col].item;
    }

    /* Save the current tile object for future reference */
    setTile(row, col, tile) {
        if (this.isValidTile(row, col)) {
            this.tiles[row][col].tile = tile;
        }
    }

    /* Flood fill all the adjacent tiles of the same item */
    floodFill(row, col, itemID, tiles) {
        if (tiles == undefined) {
            tiles = [];
        }

        /* Do not add invalid of empty tiles */
        if (!this.isValidTile(row, col) || this.isEmptyAt(row, col)) {
            return tiles;
        }

        /* Only add tile with the same item */
        if (this.getItemAt(row, col).itemID != itemID) {
            return tiles;
        }

        /* Only add unvisited tiles */
        if (tiles.filter(single_tile => single_tile.row == row && single_tile.col == col).length > 0) {
            return tiles
        }

        /* Add this tile to our list */
        tiles.push({
            row: row,
            col: col
        });

        /* Recursively flood fill adjacent neighboors */
        for (let y=-1; y<=1; y++) {
            for (let x=-1; x<=1; x++) {
                if (Math.abs(x) != Math.abs(y)) {
                    this.floodFill(row + y, col + x, itemID, tiles);
                }
            }
        }

        return tiles;
    }

    /* Get all connected tiles at this position */
    getConnectedTiles(row, col) {
        /* If it's not valid or empty */
        if (!this.isValidTile(row, col) || this.isEmptyAt(row, col)) {
            return [];
        }

        return this.floodFill(row, col, this.getItemAt(row, col).itemID);
    }

    /* Allow the interaction back after the tiles are moved */
    resetInteraction() {
        this.setInteractive(true);

        this.emit("INTERACTION_REACTIVATE", this);
    }

    /* Events */

    onTileSelected(pointer) {
        /* Only if we can pick a tile */
        if (!this.isInteractive) {
            return;
        }

        let row = Math.floor((pointer.y - this.y) / this.config.size);
        let col = Math.floor((pointer.x - this.x) / this.config.size);

        /* Only if it's a valid tile */
        if (!this.isValidTile(row, col)) {
            return;
        }

        let connectedTiles = this.getConnectedTiles(row, col);

        /* Only if the connected tiles is bigger than the minimum required */
        if (connectedTiles.length < this.config.minTilesConnected) {
            return;
        }

        this.setInteractive(false);

        let removed = 0;

        this.emit("TILES_REMOVED", this, connectedTiles.length, this.getItemAt(row, col), this.tiles[row][col].tile);

        connectedTiles.forEach(function(tile) {
            removed++;
            this.pool.push(this.tiles[tile.row][tile.col].tile);

            this.scene.tweens.add({
                targets: this.tiles[tile.row][tile.col].tile,
                alpha: 0,
                duration: this.config.destroySpeed,
                callbackScope: this,
                onComplete: function() {
                    removed--;
                    if (removed == 0) {
                        this.removeConnectedTiles(row, col);
                        //this.makeTilesFall();
                    }
                }
            });
        }, this);
    }
};