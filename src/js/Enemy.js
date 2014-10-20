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
            offsetX: this.ways[0].offsetX,
            offsetY: this.ways[0].offsetY,
    		callback: function(){
    			// exec in anime.js just like in enemy.js
    			this.currIndex++;
    			if(this.currIndex >= this.ways.length) this.currIndex = 0;

    			this.currWay.dire = this.ways[this.currIndex].dire;
    			this.currWay.dist = this.ways[this.currIndex].dist;
                this.currWay.offsetX = this.ways[this.currIndex].offsetX;
                this.currWay.offsetY = this.ways[this.currIndex].offsetY;
    			this.currWay.triggered = false;
    			this.actionChanged("walk", this.currWay.dire);
    		}
    	}

    };


    Enemy.prototype.update = function() {
    	this.updateWay();
    };

    // apis
    Enemy.prototype.setBattleAttr = function(battleAttr) {
        this.battleAttr = battleAttr;
    };
    Enemy.prototype.setRatingData = function(ratingDiv) {
        this.ratingDiv = ratingDiv;
        this.ratePercent = 0;
    };

    // in battle  this.parent is battle

    Enemy.prototype.progress = function() {
        var rateScale = 3;
        this.ratePercent += this.battleAttr.rate/rateScale;
        if(this.ratePercent > 100) {
            this.ratePercent = 0;
            this.hasAttacked = false;
        }
        return this.ratePercent;

    };


    Enemy.prototype.attack = function(target) {
    	
        // TODO enemy random phyattack or skills
        this.startPhyAttack(target);

    };

    Enemy.prototype.startPhyAttack = function(target) {

        var DIST = this.parent.DIST - 40;
        this.wayData = {
            DIST: DIST,
            offsetY: (target.y - this.y) * this.vY / DIST,
            dire: this.isPlayer ? "L" : "R"
        }
        this.actionChanged("walk", this.wayData.dire);
        this.currWay = {
            dire: this.wayData.dire,
            dist: this.wayData.DIST,
            offsetY: this.wayData.offsetY,
            callback: function(){
                this.phyAttack(target);
            }
        }
    };

    Enemy.prototype.phyAttack = function(target) {
        var ATK = this.battleAttr.ATK;
        var targetDef = target.battleAttr.DEF;
        var damage = Math.floor(ATK / (1 + targetDef / 100));
        this.handleDamage(damage, target);

        var dire = this.wayData.dire === "R" ? "L" : "R";
        this.actionChanged("walk", dire);
        this.currWay = {
            dire: dire,
            dist: this.wayData.DIST,
            offsetY: -this.wayData.offsetY,
            callback: function(){
                this.actionChanged("stand", this.wayData.dire);
                this.currWay = null;
                this.wayData = null;
                this.isAttacking = false;
                this.hasAttacked = true;
                this.parent.finishAttack();
            }
        }

    };

    Enemy.prototype.handleDamage = function(damage, target) {
        console.log("damage", damage);
        this.parent.showDamage(damage, target);
        if(target.isPlayer){
            this.parent.app.updatePlayerHP(damage);
        }else{
            this.parent.updateEnemyHP(damage, target);
        }


    };


    return Enemy;

});

