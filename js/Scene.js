define(['lib/pixi', 'Map', 'Role'], function (PIXI, Map, Role) {

    var Scene = function(name, stage){
        this.name = name;
        this.stage = stage;
        this.init();

    };

    Scene.prototype.init = function() {
        this.layer = [];
        for(var i = 0; i < 3; i++){
            this.layer[i] = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.layer[i]);
        }

    };

    Scene.prototype.enter = function() {
        var map = new Map(this.name, this.layer[0]);
        map.init();

        var properties = {};

        this.player = new Role(properties, this.layer[1]);
        this.player.init();
        
         
    };

    Scene.prototype.update = function(){

        this.player.update();

    };


    

    return Scene;

});