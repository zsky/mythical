define(['lib/pixi', 'Map', 'Role'], function (PIXI, Map, Role) {

    var Scene = function(name, container){
        console.log('new scene', container);
        this.name = name;
        this.container = container;
        this.init();

    };

    Scene.prototype.init = function() {
        this.layer = [];
        for(var i = 0; i < 4; i++){
            this.layer[i] = new PIXI.DisplayObjectContainer();
            console.log('this container', this.container);
            this.container.addChild(this.layer[i]);
        }

        var dataLoader = new PIXI.JsonLoader("resource/story/" + this.name + ".json", false);
        dataLoader.on("loaded", this.onJsonLoaded.bind(this));
        dataLoader.load(); 

    };

    Scene.prototype.onJsonLoaded = function(data) {
        console.log("load story data", data);
        this.storyData = data.content.json;



    };

    Scene.prototype.enter = function() {

        this.map = new Map(this.name, this.layer[0], this.layer[2], this);
        this.map.init();
        
        var properties = {};

        this.player = new Role(properties, this.layer[1]);
        this.player.init();
        
         
    };

    Scene.prototype.update = function(){
       

        this.player.update(this.map.barriers, this.map.boundary);

    };

    Scene.prototype.onkeydown = function(keyCode){
        console.log("scene container", this.container.x, this.container.y, this.container.width);

        this.player.onkeydown(keyCode);


    };

    Scene.prototype.onkeyup = function(keyCode){

        this.player.onkeyup(keyCode);

    };

    Scene.prototype.resizeScene = function(){
        console.log('resizeScene');
        var offsetX = 0;
        var adjust = this.map.resizeMap();
        this.container.scale.x = adjust.ratio;
        this.container.scale.y = adjust.ratio;
        if(adjust.center){
            offsetX = (window.innerWidth - this.container.width) / 2;
        } else{
            offsetX = adjust.offset;
        }
        this.container.x = offsetX;

    };

    Scene.prototype.sayWords = function(type, name){
        console.log('scene, sayWords', type, name, this.storyData);
        switch(type){
            case "npc":
                var npc = this.storyData.npc[name];
                if(npc){
                    var words = npc.words;
                    console.log("say it", words[0]);
                    var text = new PIXI.Text(words[0]);
                    text.position.x = 90;
                    text.position.y = 450;
                    this.layer[3].addChild(text);
                }
        }
    };

    Scene.prototype.addWalkin = function(obj) {
        console.log('addWalkin', obj);
    };



    

    return Scene;

});

