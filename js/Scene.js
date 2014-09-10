define(['lib/pixi', 'Map', 'Role'], function (PIXI, Map, Role) {

    var Scene = function(name, container){
        console.log('new scene', container);
        this.name = name;
        this.container = container;
        this.init();

    };

    Scene.prototype.init = function() {
        this.layer = [];
        for(var i = 0; i < 3; i++){
            this.layer[i] = new PIXI.DisplayObjectContainer();
            console.log('this container', this.container);
            this.container.addChild(this.layer[i]);
        }

    };

    Scene.prototype.enter = function() {
        this.map = new Map(this.name, this.layer[0], this.layer[2]);
        this.map.init();

        var properties = {};

        this.player = new Role(properties, this.layer[1]);
        this.player.init();
        
         
    };

    Scene.prototype.update = function(){
       

        this.player.update(this.map.barriers, this.map.ratio);

    };

    Scene.prototype.onkeydown = function(keyCode){

        this.player.onkeydown(keyCode);


    };

    Scene.prototype.onkeyup = function(keyCode){

        this.player.onkeyup(keyCode);

    };

    Scene.prototype.resizeScene = function(){
        console.log('resizeScene');
        var adjust = this.map.resizeMap();
        this.container.scale.x = adjust.ratio;
        this.container.scale.y = adjust.ratio;
        this.container.x = adjust.offset;
        console.log("offset", adjust.offset);

    };


    

    return Scene;

});

