define(['lib/pixi', 'utils', 'Anime'], function (PIXI, utils, Anime) {

    var logged = {};

    var Role = function(container, scene){

        this.container = container;
        this.scene = scene;


        // defaults
        this.actions = {};

        this.mapSpace = 30;

        this.barriers = [];
        this.walkinObjs = [];
        this.boundary = { width: 0, height: 0 };
        this.loaded = false;

    };
    utils.extend(Role, Anime);



    Role.prototype.initPlayer = function(data) {

        this.playerData = data;

        this.animationSpeed = data.animationSpeed || 0.05; 
        this.status = {
            action: "stand",
            direction: data.dire
        };
        this.x = data.x;
        this.y = data.y;
        this.vX = data.vX;
        this.vY = data.vY;

        this.loadAction(data.textureData, this.draw); 

    };



    Role.prototype.draw = function() {

        this.actionChanged("stand", this.status.direction);
        this.loaded = true;

    };

    Role.prototype.stepBack = function(back) {
        switch(this.status.direction){
            case "L":
                this.x += back;
                break;
            case "U":
                this.y += back;
                break;
            case "R":
                this.x -= back;
                break;
            case "D":
                this.y -= back;
                break;
        }
        this.actionChanged("stand", this.status.direction);
        this.notBattle = true;
        var that = this;
        setTimeout(function(){ that.notBattle = false; }, 600);
    };


    // apis
    Role.prototype.setBarriers = function(barriers) {
        this.barriers = barriers;
    };

    Role.prototype.setBoundary = function(boundary) {
        this.boundary = boundary;
    };

    Role.prototype.addWalkinObj = function(obj) {
        this.walkinObjs.push(obj);

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



    Role.prototype.update = function(){
        if(!this.loaded) return;


        var that = this;

        var barriers = this.barriers;
        var boundary = this.boundary;

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
        if(!this.notBattle && enemies){
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
                    console.log("haha i will kill you , into battle", enemy.battleData);
                    this.scene.app.toBattle(enemy.battleData, enemy);
                    return;
                }
            }
        }

        /* 
            walkin events detect
        */

        for(var i = 0; i < this.walkinObjs.length; i++){

            var obj = this.walkinObjs[i];
            if(obj.triggered) continue;
            var dire = obj.properties.requireDire;
            if(dire && dire !== this.status.direction) continue; 

            var scope = obj.scope;
            if(pY>scope.y && pY<scope.y+scope.height && pX>scope.x && pX<scope.x+scope.width){
                obj.activated = true;
                if(obj.callback) {
                    obj.callback.apply(that);
                }
            }else{
                obj.activated = false;
            }
        }



        /**
            collsion detect  && boundary detect
        */
        if(this.status.action === "walk"){
            switch(this.status.direction){
                case "L":
                    var isCollision = false;
                    isCollision = (pX < this.mapSpace) || utils.collDetect("L", barriers, pX, pY);
                    if(!isCollision) { this.x -= this.vX; this.scene.moveMap("L", this.vX);}  
                    break;
                case "U":
                    var isCollision = false;
                    isCollision = (pY < this.mapSpace) || utils.collDetect("U", barriers, pX, pY);
                    if(!isCollision) { this.y -= this.vY; this.scene.moveMap("U", this.vY);}                  
                    break;
                case "R":
                    var isCollision = false;
                    isCollision = (pX > this.boundary.width - this.mapSpace) ||  utils.collDetect("R", barriers, pX, pY);
                    if(!isCollision) { this.x += this.vX; this.scene.moveMap("R", this.vX);}        
                    break;
                case "D":
                    var isCollision = false;
                    isCollision = (pY > this.boundary.height - this.mapSpace) || utils.collDetect("D", barriers, pX, pY);
                    if(!isCollision) { this.y += this.vY; this.scene.moveMap("D", this.vY);}              
                    break;

            }

            this.currAction.position.x = this.x;
            this.currAction.position.y = this.y;

        }

    

    };

    Role.prototype.onkeydown = function(keyCode){
        if(!this.loaded) return;


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




    return Role;

});

