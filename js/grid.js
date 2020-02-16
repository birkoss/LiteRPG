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
                    value: Phaser.Math.RND.between(0, this.config.items - 1),
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
                let tileX = (this.config.size * col) + (this.config.size / 2);
                let tileY = (this.config.size * row) + (this.config.size / 2);

                let tile = this.scene.add.sprite(tileX, tileY, "tileset:tiles", this.getValueAt(row, col));
                this.add(tile);

                this.setTile(row, col, tile);
            }
        }
    }

    /* Allow to change the grid interactive state (Can we select a tile to remove it) */
    setInteractive(state) {
        this.isInteractive = state;
    }

    /* Return the amount of spaces below this position */
    emptySpacesBelow(row, col) {
        let spaces = 0;

        if (row != this.config.rows) {
            for (let r=row+1; r<this.config.rows; r++) {
                if (this.tiles[r][col].isEmpty) {
                    spaces++;
                }
            }
        }

        return spaces;
    }

    /* Swap the tile at the first position to the second position */
    swapTiles(row1, col1, row2, col2) {
        let tile = Object.assign(this.tiles[row1][col1]);

        this.tiles[row1][col1] = Object.assign(this.tiles[row2][col2]);
        this.tiles[row2][col1] = Object.assign(tile);
    }

    /* Get the tiles new position after the felt */
    arrangeBoard() {
        let movements = [];

        /* -2 because the last row can't fall */
        for(let row=this.config.rows-2; row >= 0; row--) {
            for(let col=0; col<this.config.cols; col++) {
                let emptySpaces = this.emptySpacesBelow(row, col);
                if (!this.tiles[row][col].isEmpty && emptySpaces > 0) {
                    /* Swap this tile to its destination */
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


    /* Pick new values for the new tiles */
    replenishBoard() {
        let movements = [];

        for (let i=0; i<this.config.cols; i++) {
            if (this.tiles[0][i].isEmpty) {
                let emptySpaces = this.emptySpacesBelow(0, i) + 1;
                for (let j=0; j<emptySpaces; j++) {
                    movements.push({
                        row: j,
                        col: i,
                        deltaRow: emptySpaces
                    });

                    this.tiles[j][i].value = Phaser.Math.RND.between(0, this.config.items - 1);
                    this.tiles[j][i].isEmpty = false;
                }
            }
        }

        return movements;
    }

    /* Make existing and new tiles fall */
    makeTilesFall() {
        let fallingTiles = 0;

        let fallMovements = this.arrangeBoard();
        let newMovements = this.replenishBoard();

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
            
            tile.setFrame(this.tiles[movement.row][movement.col].value);
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
        let tiles = this.listConnectedTiles(row, col);

        tiles.forEach(function(tile) {
            this.tiles[tile.row][tile.col].isEmpty = true;
        }, this);
    }

    /* Return if this tile is within boundaries and is valid */
    validPick(row, col) {
        return row >= 0 && row < this.config.rows && col >= 0 && col < this.config.cols && this.tiles[row] != undefined && this.tiles[row][col] != undefined;
    }

    /* Return the value of this tile if it's valid */
    getValueAt(row, col) {
        if (!this.validPick(row, col)) {
            return false;
        }

        return this.tiles[row][col].value;
    }

    /* Save the current tile object for future reference */
    setTile(row, col, tile) {
        if (this.validPick(row, col)) {
            this.tiles[row][col].tile = tile;
        }
    }

    /* Flood fill the array at this position with this value */
    floodFill(row, col, value, tiles) {
        if (tiles == undefined) {
            tiles = [];
        }

        if (!this.validPick(row, col) || this.tiles[row][col].isEmpty) {
            return tiles;
        }

        if (this.getValueAt(row, col) != value || this.alreadyVisited(row, col, tiles)) {
            return tiles;
        }

        tiles.push({
            row: row,
            col: col
        });

        /* Recursive floodFill with adjacent neighboors */
        for (let y=-1; y<=1; y++) {
            for (let x=-1; x<=1; x++) {
                if (Math.abs(x) != Math.abs(y)) {
                    this.floodFill(row + y, col + x, value, tiles);
                }
            }
        }

        return tiles;
    }

    /* Verify is this tile is already in the floodFill array */
    alreadyVisited(row, col, tiles) {
        let found = false;

        /* @TODO: Use filters instead */
        tiles.forEach(function(tile) {
            if (tile.row == row && tile.col == col) {
                found = true;
            }
        });

        return found;
    }

    /* Get all connected tiles at this position */
    listConnectedTiles(row, col) {
        /* If it's not valid or empty */
        if (!this.validPick(row, col) || this.tiles[row][col].isEmpty) {
            return [];
        }

        return this.floodFill(row, col, this.getValueAt(row, col));
    }

    /* Get the total connected tiles at this position */
    countConnectedTiles(row, col) {
        return this.listConnectedTiles(row, col).length;
    }

    /* Allow the interaction back after the tiles are moved */
    resetInteraction() {
        this.setInteractive(true);

        this.emit("INTERACTION_REACTIVATE", this);
    }

    /* Events */

    /* Select the tiles at this position */
    onTileSelected(pointer) {
        /* Only if we can pick a tile */
        if (!this.isInteractive) {
            return;
        }

        let row = Math.floor((pointer.y - this.y) / this.config.size);
        let col = Math.floor((pointer.x - this.x) / this.config.size);

        /* Only if it's a valid tile */
        if (!this.validPick(row, col)) {
            return;
        }

        /* Only if the connected tiles is bigger than the minimum required */
        if (this.countConnectedTiles(row, col) < this.config.minTilesConnected) {
            return;
        }

        this.setInteractive(false);

        let tilesRemoved = this.listConnectedTiles(row, col);
        let removed = 0;

        this.emit("TILES_REMOVED", this, tilesRemoved.length, this.tiles[row][col].value);

        tilesRemoved.forEach(function(tile) {
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

                        this.makeTilesFall();
                    }
                }
            });
        }, this);
    }

};