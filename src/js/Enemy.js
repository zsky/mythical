define(['lib/pixi', 'utils', 'Anime'], function (PIXI, utils, Anime) {

    var Enemy = function(container, data, parent){

    	this.container = container;
    	this.parent = parent;
    	this.textureData = data.textureData;
    	this.ways = data.ways || [];
    	this.battleData = data.battleData || "";

    	this.x = data.start.x;
    	this.y = data.start.y;
    	this.vX = data.vX || 2;
    	this.vY = data.vY || 2;
    	this.triggerRadius = data.triggerRadius || 0;


    	// defaults
    	this.animationSpeed = 0.06;
    	this.actions = {};
    	this.currIndex = 0;


    	this.init();

    };
    utils.extend(Enemy, Anime);

    Enemy.prototype.init = function() {
    	this.loadAction(this.textureData);
    };

    Enemy.prototype.goAround = function() {
    	this.actionChanged("walk", this.ways[0].dire);
    	this.currWay = {
    		dire: this.ways[0].dire,
    		dist: this.ways[0].dist,
    		callback: function(){
    			// exec in anime.js just like in enemy.js
    			this.currIndex++;
    			if(this.currIndex >= this.ways.length) this.currIndex = 0;

    			this.currWay.dire = this.ways[this.currIndex].dire;
    			this.currWay.dist = this.ways[this.currIndex].dist;
    			this.currWay.triggered = false;
    			this.actionChanged("walk", this.currWay.dire);
    		}
    	}

    };


    Enemy.prototype.update = function() {
    	this.updateWay();
    };

    // in battle

    Enemy.prototype.draw = function() {

    	this.inBattle = true;
    	action_name = "walkR";

    	this.currAction  && this.container.removeChild(this.currAction);

    	this.currAction = this.actions[action_name];
    	this.currAction.animationSpeed = this.animationSpeed;

    	this.currAction.position.x = this.x;
    	this.currAction.position.y = this.y;


    	this.container.addChild(this.currAction);
    };

    Enemy.prototype.attack = function() {
    	
    	this.currIndex = 0;
    	this.ways = [
    		{ dire: "R", dist: 400 },
    		{ dire: "L", dist: 400 }
    	]

    	this.goAround();

    };
    Enemy.prototype.finishAttack = function() {
    	this.currWay = null;
    	action_name = "walkR";

    	this.currAction  && this.container.removeChild(this.currAction);

    	this.currAction = this.actions[action_name];
    	this.currAction.animationSpeed = this.animationSpeed;

    	this.currAction.position.x = this.x;
    	this.currAction.position.y = this.y;

    	this.currAction.stop();

    	this.container.addChild(this.currAction);
    };


    return Enemy;

});

