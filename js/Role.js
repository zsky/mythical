define(['lib/pixi'], function (PIXI) {

    var Role = function(properties, container){

        this.container = container;

        this.attack = properties.attack || 0;
        this.hp = properties.hp || 0;

        this.status = {
            action: "stand",
            direction: "U"
        };

        this.x = properties.x || 210;
        this.y = properties.y || 435;

        this.vX = 3;
        this.vY = 3;

        this.actions = {};
        this.animationSpeed = 0.2;



        // texture 
        this.textureData = {
            actions: ["walkdown", "walkleft", "walkright", "walkup"],
            imgWidth: 100,
            imgHeight: 100,
            frame_num: 4,
            ratio: 0.5
        };

        this.collisionSpace = 5;


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

        for(var i = 0; i < this.textureData.actions.length; i++){
            frames = [];
            var action_name = this.textureData.actions[i];
            for(var j = 0; j < this.textureData.frame_num; j++){

                
                var texture = PIXI.Texture.fromFrame(action_name + j);
                frames.push(texture);

            }
            this.actions[action_name] = new PIXI.MovieClip(frames);
            this.actions[action_name].scale.x = this.textureData.ratio;
            this.actions[action_name].scale.y = this.textureData.ratio;
        }


        this.currAction = this.actions.walkup;
        this.currAction.animationSpeed = this.animationSpeed;

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;

        this.container.addChild(this.currAction);




    };


    Role.prototype.onDataLoaded = function(){

        console.log("role data loaded");

    };


    Role.prototype.actionChanged = function(action, direction){

        console.log("role container", this.container.x, this.container.y, this.container.width);

        console.log('actionChanged to', action, direction);
        this.container.removeChild(this.currAction);

        // update status
        this.status.action = action;
        this.status.direction = direction;
        console.log('currAction width', this.currAction.width, this.currAction.height);

        switch(action){
            case "walk":
                if(direction === "L"){
                    this.currAction = this.actions.walkleft;
                } else if(direction === "U"){
                    this.currAction = this.actions.walkup;
                } else if(direction === "R"){
                    this.currAction = this.actions.walkright;
                } else if(direction === "D"){
                    this.currAction = this.actions.walkdown;
                }
                this.currAction.play();
                break;
            case "stand":
                if(direction === "L"){
                    this.currAction = this.actions.walkleft;
                } else if(direction === "U"){
                    this.currAction = this.actions.walkup;
                } else if(direction === "R"){
                    this.currAction = this.actions.walkright;
                } else if(direction === "D"){
                    this.currAction = this.actions.walkdown;
                }
                this.currAction.stop();
                break;
        }

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;
        this.currAction.animationSpeed = this.animationSpeed;
        this.container.addChild(this.currAction);


    };

    Role.prototype.update = function(barriers, boundary){


        var that = this;

        barriers = barriers || [];

        var pX = that.x + that.currAction.width/2;
        var pY = that.y + that.currAction.height/2;
        

        if(this.status.action === "walk"){
            switch(this.status.direction){
                case "L":
                    var isCollision = false;
                    isCollision = (pX < 0) || collisionDetect("L");
                    if(!isCollision) { this.x -= this.vX; }  
                    break;
                case "U":
                    var isCollision = false;
                    isCollision = (pY < 0) || collisionDetect("U");
                    if(!isCollision) { this.y -= this.vY; }                  
                    break;
                case "R":
                    var isCollision = false;
                    isCollision = (pX > boundary.width) || collisionDetect("R");
                    if(!isCollision) { this.x += this.vX; }        
                    break;
                case "D":
                    var isCollision = false;
                    isCollision = (pY > boundary.height) || collisionDetect("D");
                    if(!isCollision) { this.y += this.vY; }              
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
                if(this.status.action !== "walk" || this.status.direction !== "L"){
                    this.actionChanged("walk", "L");
                }
                break;
            case 38:
                if(this.status.action !== "walk" || this.status.direction !== "U"){
                    this.actionChanged("walk", "U");
                }
                break;
            case 39:
                if(this.status.action !== "walk" || this.status.direction !== "R"){
                    this.actionChanged("walk", "R");
                }
                break;
            case 40:
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


    return Role;

});

