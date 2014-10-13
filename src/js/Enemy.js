define(['lib/pixi'], function (PIXI) {

    var Enemy = function(container, enemyData){

    	this.container = container;
    	this.textureData = enemyData.textureData;
    	this.battleData = enemyData.battleData || "";

    	this.x = enemyData.route.start.x;
    	this.y = enemyData.route.start.y;
    	this.vX = enemyData.route.vX;
    	this.vY = enemyData.route.vY;
    	this.triggerRadius = enemyData.route.triggerRadius || 0;

    	this.animationSpeed = 0.08;

    	this.ways = enemyData.route.ways || [];


    	this.actions = [];

    	this.currIndex = 0;

    	this.load();



    };

    Enemy.prototype.load = function(){
    	console.log("load Enemy");

        var image = new PIXI.ImageLoader(this.textureData.path);
        image.on("loaded", function(){
            console.log('image loaded');
        });

        var baseTexture = image.texture.baseTexture;
        var imgWidth = this.textureData.imgWidth,
            imgHeight = this.textureData.imgHeight;
        for(var i = 0; i < this.textureData.actions.length; i++){
            for(var j = 0; j < this.textureData.frame_num; j++){
                var action_name = this.textureData.actions[i];
                PIXI.TextureCache[action_name+j] = new PIXI.Texture(baseTexture, {
                                                   x: j*imgWidth,
                                                   y: i*imgHeight,
                                                   width: imgWidth,
                                                   height: imgHeight
                                               });
            }
        }
        console.log('pixi TextureCache', PIXI.TextureCache);
        
        image.load();

        var frames = [];
        var action_name;

        for(var i = 0; i < this.textureData.actions.length; i++){
            frames = [];
            action_name = this.textureData.actions[i];
            for(var j = 0; j < this.textureData.frame_num; j++){

                
                var texture = PIXI.Texture.fromFrame(action_name + j);
                frames.push(texture);

            }
            this.actions[action_name] = new PIXI.MovieClip(frames);
            this.actions[action_name].scale.x = this.textureData.ratio;
            this.actions[action_name].scale.y = this.textureData.ratio;
        }  


    };


    Enemy.prototype.animate = function() {
    	
    	if(this.currIndex >= this.ways.length){
    		this.currIndex = 0;
    	}
    	this.currWay = this.ways[this.currIndex];
    	this.currDist = this.currWay.dist;

    	action_name = "walk" + this.currWay.dire;

    	this.currAction  && this.container.removeChild(this.currAction);

    	this.currAction = this.actions[action_name];
    	this.currAction.animationSpeed = this.animationSpeed;

    	this.currAction.position.x = this.x;
    	this.currAction.position.y = this.y;

    	this.currAction.play();

    	this.container.addChild(this.currAction);

    };

    Enemy.prototype.update = function() {
    	
    	if(!this.currWay) return;

    	if(this.currDist < 0){
    		if(this.inBattle){
    			if(this.currIndex === 1){
    				this.currIndex = 0;
    				this.finishAttack();
    			}else{
    				this.currIndex = 1;
    				console.log('attack you!!!');
    				this.animate();
    			}
    		}else{
    			this.currIndex++;
    			this.animate();
    		}

    	}else{
    		switch(this.currWay.dire){
    			case "L": 
    				this.x -= this.vX;
    				this.currDist -= this.vX;
    				break;
    			case "U": 
    				this.y -= this.vY;
    				this.currDist -= this.vY;
    				break;
    			case "R": 
    				this.x += this.vX;
    				this.currDist -= this.vX;
    				break;
    			case "D": 
    				this.y += this.vY;
    				this.currDist -= this.vX;
    				break;

    		}
    		this.currAction.position.x = this.x;
    		this.currAction.position.y = this.y;
    	}

    	
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

    	this.animate();

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

