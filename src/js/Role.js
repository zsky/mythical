define(['lib/pixi'], function (PIXI) {

    var Role = function(playerData, container, scene){

        this.container = container;
        this.scene = scene;

        //this.attack = properties.attack || 0;
        //this.hp = properties.hp || 0;

        this.status = playerData.status;

        this.x = playerData.properties.x;
        this.y = playerData.properties.y;

        this.vX = playerData.properties.vX;
        this.vY = playerData.properties.vY;

        this.actions = {};
        this.animationSpeed = 0.05;

        // texture 
        this.textureData = playerData.textureData;

        this.collisionSpace = 5;
        this.mapSpace = 30;

        this.barriers = [];
       

        this.walkinObjs = [];

        this.init();



    };

    Role.prototype.init = function(){

        var image = new PIXI.ImageLoader("resource/role/qiangu.png");
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

    Role.prototype.draw = function() {
        action_name = "walk" + this.status.direction;

        this.currAction  && this.container.removeChild(this.currAction);

        this.currAction = this.actions[action_name];
        this.currAction.animationSpeed = this.animationSpeed;

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;

        this.container.addChild(this.currAction);
    };


    Role.prototype.actionChanged = function(action, direction){

        console.log('actionChanged to', action, direction);
        this.container.removeChild(this.currAction);

        // update status
        this.status.action = action;
        this.status.direction = direction;

        var action_name;
        switch(action){
            case "walk":
                action_name = "walk" + this.status.direction;
                this.currAction = this.actions[action_name];
                this.currAction.play();
                break;
            case "stand":
                action_name = "walk" + this.status.direction;
                this.currAction = this.actions[action_name];
                this.currAction.stop();
                break;
        }

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;
        this.currAction.animationSpeed = this.animationSpeed;
        this.container.addChild(this.currAction);


    };

    Role.prototype.update = function(){


        var that = this;

        var barriers = this.barriers;
        var boundary = this.boundary || {};

        var pX = that.x + that.currAction.width/2;
        var pY = that.y + that.currAction.height/2;

        // walkin events detect

        for(var i = 0; i < this.walkinObjs.length; i++){
            
            var obj = this.walkinObjs[i];
            if(obj.triggered) continue;
            if(obj.properties && obj.properties.dire === "D"){
                if(pY>obj.y+obj.height && pX>obj.x && pX<obj.x+obj.width){
                    console.log('walkinnnnnnnnnnnnnnnnnnnn obj', obj);
                    obj.callback(obj.args);
                    obj.triggered = true;
                }
                    
            }
        }


        // collsion detect  && boundary detect
        if(this.status.action === "walk"){
            switch(this.status.direction){
                case "L":
                    var isCollision = false;
                    isCollision = (pX < this.mapSpace) || collisionDetect("L");
                    if(!isCollision) { this.x -= this.vX; this.scene.moveMap("L", this.vX);}  
                    break;
                case "U":
                    var isCollision = false;
                    isCollision = (pY < this.mapSpace) || collisionDetect("U");
                    if(!isCollision) { this.y -= this.vY; this.scene.moveMap("U", this.vY);}                  
                    break;
                case "R":
                    var isCollision = false;
                    isCollision = (pX > this.boundary.width - this.mapSpace) ||  collisionDetect("R");
                    if(!isCollision) { this.x += this.vX; this.scene.moveMap("R", this.vX);}        
                    break;
                case "D":
                    var isCollision = false;
                    isCollision = (pY > this.boundary.height - this.mapSpace) || collisionDetect("D");
                    if(!isCollision) { this.y += this.vY; this.scene.moveMap("D", this.vY);}              
                    break;

            }

            this.currAction.position.x = this.x;
            this.currAction.position.y = this.y;

        }

        function collisionDetect(dire){
            var space = that.collisionSpace;
            for(var i = 0; i < barriers.length; i++){
                
                if(barriers[i].ellipse){
                    var r = barriers[i].width/2;
                    var cX = barriers[i].x + r;
                    var cY = barriers[i].y + r;
                    var dist2 = (cX - pX)*(cX - pX) + (cY - pY)*(cY - pY);
                    if(dire=="L" && pX>cX && dist2 < r*r) return true;
                    if(dire=="U" && pY>cY && dist2 < r*r) return true;
                    if(dire=="R" && pX<cX && dist2 < r*r) return true;
                    if(dire=="D" && pY<cY && dist2 < r*r) return true;
                }else{
                    var b = {};
                    b.x = barriers[i].x;
                    b.y = barriers[i].y;
                    b.w = barriers[i].width;
                    b.h = barriers[i].height;
                    if(dire=="L" && pY>b.y && pY<b.y+b.h && pX>b.x && pX<b.x+b.w+space)
                        return true;
                    if(dire=="U" && pY>b.y && pY<b.y+b.h+space && pX>b.x && pX<b.x+b.w)
                        return true;
                    if(dire=="R" && pY>b.y && pY<b.y+b.h && pX>b.x-space && pX<b.x+b.w)
                        return true;
                    if(dire=="D" && pY>b.y-space && pY<b.y+b.h && pX>b.x && pX<b.x+b.w)
                        return true;
                    
                }
            }
            return false;

        }
    

    };

    Role.prototype.onkeydown = function(keyCode){


        switch(keyCode){
            case 37:  
            case 65:  //  w
                if(this.status.action !== "walk" || this.status.direction !== "L"){
                    this.actionChanged("walk", "L");
                }
                break;
            case 38:
            case 87:
                if(this.status.action !== "walk" || this.status.direction !== "U"){
                    this.actionChanged("walk", "U");
                }
                break;
            case 39:
            case 68:
                if(this.status.action !== "walk" || this.status.direction !== "R"){
                    this.actionChanged("walk", "R");
                }
                break;
            case 40:
            case 83:
                if(this.status.action !== "walk" || this.status.direction !== "D"){
                    this.actionChanged("walk", "D");
                }
                break;


        }

    };

    Role.prototype.onkeyup = function(keyCode){
        if(this.status.action !== "stand"){
            this.actionChanged("stand", this.status.direction);
        }

    };

    Role.prototype.addWalkinObj = function(obj) {
        this.walkinObjs.push(obj);

    };


    return Role;

});

