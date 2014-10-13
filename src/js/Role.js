define(['lib/pixi'], function (PIXI) {

    var logged = {};

    var Role = function(container, scene){

        this.container = container;
        this.scene = scene;


        this.actions = {};

        this.collisionSpace = 5;
        this.mapSpace = 30;

        this.barriers = [];
       

        this.walkinObjs = [];




    };

    Role.prototype.load = function(){

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

        this.draw();

        


    };

    Role.prototype.draw = function() {

        action_name = "walk" + this.status.direction;

        this.currAction  && this.container.removeChild(this.currAction);

        this.currAction = this.actions[action_name];
        console.log("drawit", this.actions, action_name);
        this.currAction.animationSpeed = this.animationSpeed;

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;

        this.container.addChild(this.currAction);
    };

    Role.prototype.moveToIt = function(e) {
        if(this.scene.mode === "dialog") return;
        var pos = e.getLocalPosition(this.scene.container);
        var distX = pos.x - this.x;
        var distY = pos.y - this.y;
        this.currTarget = {
            pos: pos
        };
        if(Math.abs(distX) > Math.abs(distY)){
            if(distX > 0){
                this.actionChanged("walk", "R");
            }else{
                this.actionChanged("walk", "L");
            }
            this.currTarget.stateX = "ing";
            this.currTarget.stateY = "to";
        }else{
            if(distY > 0){
                this.actionChanged("walk", "D");
            }else{
                this.actionChanged("walk", "U");
            }
            this.currTarget.stateX = "to";
            this.currTarget.stateY = "ing";
        }
        console.log("move to target", this.currTarget);
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


        // move to target
        if(this.currTarget){
            if(this.currTarget.stateX === "ing" && Math.abs(this.x - this.currTarget.pos.x) < this.vX){
                this.currTarget.stateX = "ed";
                if(this.currTarget.stateY === "to"){
                    this.currTarget.stateY = "ing";
                    if(this.y < this.currTarget.pos.y){
                        this.actionChanged("walk", "D");
                    }else {
                        this.actionChanged("walk", "U");
                    } 
                }else{
                    this.currTarget = "";
                    this.actionChanged("stand", this.status.direction);
                }
            }
            if(this.currTarget.stateY === "ing" && Math.abs(this.y - this.currTarget.pos.y) < this.vX){
                this.currTarget.stateY = "ed";
                if(this.currTarget.stateX === "to"){
                    this.currTarget.stateX = "ing";
                    if(this.x < this.currTarget.pos.x){
                        this.actionChanged("walk", "R");
                    }else {
                        this.actionChanged("walk", "L");
                    } 
                }else{
                    this.currTarget = "";
                    this.actionChanged("stand", this.status.direction);
                }
            }

        }


        // enemies detect
        var enemies = this.scene.getEnemies();
        if(enemies){
            if(!logged[enemies]){
                console.log("enemies detectt", enemies);
                logged[enemies] = true;
            }
            
            for(var i = 0; i < enemies.length; i++){
                var enemy = enemies[i];
                var dx2 = (enemy.x - pX) * (enemy.x - pX);
                var dy2 = (enemy.y - pY) * (enemy.y - pY);
                var r = enemy.triggerRadius;
                if(dx2 + dy2 < r * r){
                    console.log("haha i will kill you , into battle");
                    this.scene.toBattle(enemy.battleData);
                    return;
                }
            }
        }

        // walkin events detect

        for(var i = 0; i < this.walkinObjs.length; i++){
            
            var obj = this.walkinObjs[i];
            if(obj.triggered) continue;

            if(obj.type === "mark"){
                var dire = obj.properties.dire;
                if(this.status.direction !== dire) continue;

                switch(dire){
                    case "U":
                        if(pX>obj.x && pX<obj.x+obj.width && pY<obj.y){
                            obj.callback(obj.args);
                            obj.triggered = true;
                        }
                        break;
                    case "D":
                        if(pX>obj.x && pX<obj.x+obj.width && pY>obj.y){
                            console.log("rolejs walkin obj args", obj.args, obj);
                            obj.callback(obj.args);
                            obj.triggered = true;
                        }
                        break;
                    case "R":
                        if(pY>obj.y && pY<obj.y+obj.height && pX>obj.x){
                            obj.callback(obj.args);
                            obj.triggered = true;
                        }
                        break;
                    case "L":
                        if(pY>obj.y && pY<obj.y+obj.height && pX<obj.x){
                            obj.callback(obj.args);
                            obj.triggered = true;
                        }
                        break;
                }
            }else{
                var scope = obj.scope;
                if(pY>scope.y && pY<scope.y+scope.height && pX>scope.x && pX<scope.x+scope.width){
                    obj.activated = true;
                }else{
                    obj.activated = false;
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

    Role.prototype.setData = function(data) {
        this.playerData = data;
        
        this.textureData = data.textureData;
        this.status = {
            action: "stand",
            direction: data.dire
        }
        this.x = data.x;
        this.y = data.y;

        this.vX = data.vX;
        this.vY = data.vY;
        
        this.animationSpeed = 0.05;
        this.load();
    };


    return Role;

});

