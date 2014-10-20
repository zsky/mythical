define(['lib/pixi'], function (PIXI) {

    var Anime = function(){

    };

    Anime.prototype.loadAction = function(textureData, callback){
    	console.log("anime load action");

        var image = new PIXI.ImageLoader(textureData.path);
        image.on("loaded", function(){
            console.log('image loaded');
        });

        var strip = textureData.strip || { x: 0, y: 0};

        var baseTexture = image.texture.baseTexture;
        var imgWidth = textureData.imgWidth,
            imgHeight = textureData.imgHeight;
        for(var i = 0; i < textureData.actions.length; i++){
            for(var j = 0; j < textureData.frame_num; j++){
                var action_name = textureData.actions[i];
                PIXI.TextureCache[action_name+j] = new PIXI.Texture(baseTexture, {
                                                   x: j*imgWidth + strip.x,
                                                   y: i*imgHeight + strip.y,
                                                   width: imgWidth - strip.x,
                                                   height: imgHeight - strip.y
                                               });
            }
        }
        console.log('pixi TextureCache', PIXI.TextureCache);
        
        image.load();

        var frames = [];
        var action_name;

        for(var i = 0; i < textureData.actions.length; i++){
            frames = [];
            action_name = textureData.actions[i];
            for(var j = 0; j < textureData.frame_num; j++){

                
                var texture = PIXI.Texture.fromFrame(action_name + j);
                frames.push(texture);

            }
            this.actions[action_name] = new PIXI.MovieClip(frames);
            this.actions[action_name].scale.x = textureData.ratio;
            this.actions[action_name].scale.y = textureData.ratio;
        }

        if(callback) callback.call(this);

    };

    Anime.prototype.actionChanged = function(action, direction){

        this.currAction && this.container.removeChild(this.currAction);

        // update status
        if(this.status){
            this.status.action = action;
            this.status.direction = direction;
        }
        
        var action_name;
        switch(action){
            case "walk":
                action_name = "walk" + direction;
                this.currAction = this.actions[action_name];
                this.currAction.play();
                break;
            case "stand":
                action_name = "walk" + direction;
                this.currAction = this.actions[action_name];
                this.currAction.gotoAndStop(0);
                break;
        }

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;
        this.currAction.animationSpeed = this.animationSpeed;
        this.container.addChild(this.currAction);

        //this.currAction.tint = Math.random() * 0xFFFFFF;
    };
    Anime.prototype.setPos = function(pos) {
        this.x = pos.x;
        this.y = pos.y;
        this.actionChanged("stand", pos.dire);
    };



    Anime.prototype.updateWay = function() {
    	
    	if(!this.currWay) return;

    	if(this.currWay.dist < 0){ 
            if(this.currWay.callback && !this.currWay.triggered){
                this.currWay.triggered = true;
                this.currWay.callback.call(this);
            }
    	}else{
    		switch(this.currWay.dire){
    			case "L": 
    				this.x -= this.vX;
    				this.currWay.dist -= this.vX;
    				break;
    			case "U": 
    				this.y -= this.vY;
    				this.currWay.dist -= this.vY;
    				break;
    			case "R": 
    				this.x += this.vX;
    				this.currWay.dist -= this.vX;
    				break;
    			case "D": 
    				this.y += this.vY;
    				this.currWay.dist -= this.vX;
    				break;

    		}
            if(this.currWay.offsetX) this.x += this.currWay.offsetX;
            if(this.currWay.offsetY) this.y += this.currWay.offsetY;
            

    		this.currAction.position.x = this.x;
    		this.currAction.position.y = this.y;
    	}
    	
    };

    // in battle



    Anime.prototype.attack = function() {

        var way0 = {}, way1 = {};
        way0.dist = 400;
        way1.dist = 400;
        if(this.category === "battleEnemy"){
            way1.dire = "L";
            way1.callback = function(){
                this.actionChanged("stand", "R");
                this.currWay = "";
            }

            way0.dire = "R";
            way0.callback = this.bindCallback("attack", way1);
        }

        this.goWay(way0);

    };
    Anime.prototype.bindCallback = function(flag, way) {
        if(flag === "attack"){
            return function(){
                console.log("attack you!!!!");
                var that = this;
                setTimeout(function(){
                    that.goWay(way);
                }, 200);
            }
        }
    };



    return Anime;

});

