class SceneTransition extends Phaser.Scene {

	static FALL_DOWN = 1;
	static MOVE_DOWN = 1;
	
	static MOVE_UP = 2;
	static MOVE_LEFT = 3;
	static MOVE_RIGHT = 4;

	static IN = 1;
	static OUT = 2;

	constructor(settings) {
        super(settings);

        this.transitions = [];
	}

	addTransition(target, type, config) {
		this.transitions.push({
			target: target,
			type: type,
			config: config,
			isDone: false
		});
	}

	startTransition(type, onCompleteCallback) {
		this.onCompleteCallback = onCompleteCallback;

		console.log(this.transitions);

		this.transitions.forEach(single_transition => {
			single_transition.isDone = false;

			switch(single_transition.type) {
				case SceneTransition.MOVE_DOWN:
				case SceneTransition.MOVE_UP:
					let moveStartY = 0;
					let moveDestY = 0;

					let positionOutsideY = -single_transition.target.getBounds().height;
					if (single_transition.type == SceneTransition.MOVE_UP) {
						positionOutsideY = this.sys.game.canvas.height;
					}

					if (type == SceneTransition.IN) {
						moveDestY = single_transition.target.y;
						moveStartY = positionOutsideY;
					} else if (type == SceneTransition.OUT) {
						moveStartY = single_transition.target.y;
						moveDestY = positionOutsideY;
					}

					/* Only move the target if it changed */
					if (moveStartY != single_transition.target.y) {
						single_transition.target.y = moveStartY;
					}

	                this.tweens.add({
	                    targets: single_transition.target,
	                    y: moveDestY,
	                    ease: 'Cubic',
	                    duration: 300,
	                    onComplete: function () {
	                    	console.log("onComplete");
	                    	this.onTransitionCompleted(single_transition);
	                    },
	                    onCompleteScope: this
	                });
	                break;
				case SceneTransition.MOVE_LEFT:
				case SceneTransition.MOVE_RIGHT:
					let moveStartX = 0;
					let moveDestX = 0;

					let positionOutsideX = -single_transition.target.getBounds().width - single_transition.target.getBounds().width;
					if (single_transition.type == SceneTransition.MOVE_RIGHT) {
						positionOutsideX = this.sys.game.canvas.width + single_transition.target.getBounds().width;
					}

					if (type == SceneTransition.IN) {
						moveDestX = single_transition.target.x;
						moveStartX = positionOutsideX;
					} else if (type == SceneTransition.OUT) {
						moveStartX = single_transition.target.x;
						moveDestX = positionOutsideX;
					}

					/* Only move the target if it changed */
					if (moveStartX != single_transition.target.x) {
						single_transition.target.x = moveStartX;
					}

	                this.tweens.add({
	                    targets: single_transition.target,
	                    x: moveDestX,
	                    ease: 'Cubic',
	                    duration: 300,
	                    onComplete: function () {
	                    	console.log("onComplete X", single_transition.target.x);
	                    	this.onTransitionCompleted(single_transition);
	                    },
	                    onCompleteScope: this
	                });
	                break;
			}
		});
	}


	/* Events */

	onTransitionCompleted(transition) {
		transition.isDone = true;

		console.log("onTransitionCompleted", this.onCompleteCallback);

		if (this.onCompleteCallback != undefined && this.transitions.filter(single_transition => !single_transition.isDone).length == 0) {
			this.onCompleteCallback();
		}
	}
};

/*

                this.tweens.add({
                    targets: this.levels_container.getAt(i),
                    y: this.levels_container.getAt(i).destination_y,
                    ease: 'Cubic',
                    duration: 300,
                    delay: i * 50,
                    onComplete: this.onLevelSelectorVisible,
                    onCompleteScope: this
                });

*/