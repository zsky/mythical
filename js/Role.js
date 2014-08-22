define(['lib/pixi'], function (PIXI) {

    var Role = function(properties, container){

        this.container = container;

        this.attack = properties.attack || 0;
        this.hp = properties.hp || 0;

        this.status = {
            action: "stand",
            direction: "R"
        };

        this.x = properties.x || 600;
        this.y = properties.y || 40;

        this.vX = 3;
        this.vY = 3;

    };

    Role.prototype.init = function(){


        /*var datas = ["Graphics/girl/girl2.json"];
        var loader = new PIXI.AssetLoader(datas);
        loader.onComplete = this.onDataLoaded.bind(this);
        loader.load();*/

        var image = new PIXI.ImageLoader("Graphics/Characters/Actor1.png");
        image.on("loaded", function(){
            console.log('image loaded');
        });

        var baseTexture = image.texture.baseTexture;
        var imgWidth = 32,
            imgHeight = 32;
        for(var i = 0; i < 3; i++){
            PIXI.TextureCache["walkdown"+i] = new PIXI.Texture(baseTexture, {
                                               x: i*imgWidth,
                                               y: 0,
                                               width: imgWidth,
                                               height: imgHeight
                                           });
            PIXI.TextureCache["walkleft"+i] = new PIXI.Texture(baseTexture, {
                                               x: i*imgWidth,
                                               y: imgHeight,
                                               width: imgWidth,
                                               height: imgHeight
                                           });
        }

        


        image.load();

        this.actions = {};

        var walkdownFrames = [];
        var walkleftFrames = [];

        for (var i = 0; i < 3; i++)
        {
            var texture = PIXI.Texture.fromFrame("walkdown" + i);
            walkdownFrames.push(texture);
            var texture2 = PIXI.Texture.fromFrame("walkleft" + i);
            walkleftFrames.push(texture2);
        };

        this.actions["walkdown"] = new PIXI.MovieClip(walkdownFrames);
        this.actions["walkleft"] = new PIXI.MovieClip(walkleftFrames);

        this.currAction = this.actions.walkleft;
        this.currAction.animationSpeed = 0.3;

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;

        this.container.addChild(this.currAction);



 

        var that = this;



        // listen events
        document.addEventListener("keydown", function(e){
            console.log('keydown', e.keyCode);
           
            switch(e.keyCode){
                case 37:
                  that.status.direction = "L";
                  break;
                case 38:
                  that.status.direction = "U";
                  break;
                case 39:
                  that.status.direction = "R";                
                  break;
                case 40:
                  that.status.direction = "D";
                  break;                 
            };

            if(that.status.action !== "walk"){
                that.actionChanged("walk");
            }
        });

        document.addEventListener("keyup", function(e){
            console.log("keyup", e.keyCode);
            if(that.status.action !== "stand"){
                that.actionChanged("stand");
            }
        });

    };

    Role.prototype.test = function(){

        var actionFrames = [];

        for (var i = 0; i < 3; i++)
        {
            var texture = PIXI.Texture.fromFrame("walk" + i);
            actionFrames.push(texture);
        };

        action = new PIXI.MovieClip(actionFrames);

        action.animationSpeed  = 0.1;

        action.play();

        this.container.addChild(action);
    },


    Role.prototype.onDataLoaded = function(){

        console.log("role data loaded");


        /*var actionFrames = [];

        for (var i = 0; i < 5; i++)
        {
            var texture = PIXI.Texture.fromFrame("girl000" + i + ".png");
            actionFrames.push(texture);
        };

        action = new PIXI.MovieClip(actionFrames);

        this.container.addChild(action);*/




    };


    Role.prototype.actionChanged = function(action){

        console.log('actionChanged to', action);
        this.status.action = action;

        if(this.status.direction === "L"){

            this.container.removeChild(this.currAction);
            this.currAction = this.actions.walkleft;
            this.currAction.position.x = this.x;
            this.currAction.position.y = this.y;
            this.container.addChild(this.currAction);
        }
        if(this.status.direction === "D"){

            this.container.removeChild(this.currAction);
            this.currAction = this.actions.walkdown;
            this.currAction.position.x = this.x;
            this.currAction.position.y = this.y;
            this.container.addChild(this.currAction);
        }

        if(action === "walk"){
            this.currAction.play();
            //this.spine.state.setAnimationByName("walk", true);
        } else{
            this.currAction.stop();
            //this.spine.state.setAnimationByName("walk", false);
        }

    };


    Role.prototype.update = function(){

        if(this.status.action === "walk"){
            if(this.status.direction === "L"){
                this.x -= this.vX;
            } else if(this.status.direction === "D"){
                this.y += this.vY;
            }
        }

        this.currAction.position.x = this.x;
        this.currAction.position.y = this.y;

        /*var spineBoy = this.spine;
        if(spineBoy && this.status.action === "walk"){
            switch(this.status.direction){
                case "R":
                  spineBoy.position.x += this.vX;
                  break;

            }
        };*/      

    };

    return Role;

});
