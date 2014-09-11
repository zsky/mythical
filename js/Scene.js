define(['lib/pixi', 'Map', 'Role'], function (PIXI, Map, Role) {

    var Scene = function(name, container){
        console.log('new scene', container);
        this.name = name;
        this.container = container;

        this.init();

    };

    Scene.prototype.init = function(){
        this.layer = [];
        for(var i = 0; i < 4; i++){
            this.layer[i] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.layer[i]);
        }

        var storyLoader = new PIXI.JsonLoader("resource/story/" + this.name + ".json", false);
        storyLoader.on("loaded", this.onStoryLoaded.bind(this));
        storyLoader.load(); 

    };

    Scene.prototype.onStoryLoaded = function(data) {
        console.log("story data loaded", data);
        this.storyData = data.content.json;

        this.loadMapData(this.storyData.map);

         

    };

    Scene.prototype.loadMapData = function(mapName) {
        // start load map data
        var mapLoader = new PIXI.JsonLoader("resource/map/" + mapName + ".json", false);
        mapLoader.on("loaded", this.onMapLoaded.bind(this));
        mapLoader.load();
    };

    Scene.prototype.onMapLoaded = function(data){
        console.log("map data loaded", data);
        this.mapData = data.content.json;
        var baseImageUrl = "resource/map/";
        
        // load image data
        for(var i = 0; i < this.mapData.tilesets.length; i++){
            var tileset = this.mapData.tilesets[i];
         
            var image = new PIXI.ImageLoader(baseImageUrl + tileset.image);
            image.on("loaded", function(){
                console.log('image loaded');
            });

            this.loadTileset(tileset, image);
            image.load();
        }

        console.log("data loaded, TextureCache", PIXI.TextureCache);
        this.enter();  // enter the scene

    };

    Scene.prototype.loadTileset = function(tileset, image){
        console.log('loadTileset', this, tileset);
        
        var baseTexture = image.texture.baseTexture;
        var widthNum = Math.floor(tileset.imagewidth/tileset.tilewidth);
        var heightNum = Math.floor(tileset.imageheight/tileset.tileheight);
        console.log('widthNum', widthNum, heightNum);
        for(var i = 0; i < widthNum; i++){
            for(var j = 0; j < heightNum; j++){
                var textureName = this.name + (tileset.firstgid + j*widthNum + i);

                PIXI.TextureCache[textureName] = new PIXI.Texture(baseTexture, {
                                            x: i*tileset.tilewidth,
                                            y: j*tileset.tileheight,
                                            width: tileset.tilewidth,
                                            height: tileset.tileheight
                                        });

            }
        }



    };

    Scene.prototype.enter = function() {

        var playerData = this.storyData.player;

        this.player = new Role(playerData, this.layer[1]);
       

        this.map = new Map(this.name, this.mapData, this.layer[0], this.layer[2], this);

        

        this.resizeScene();  // resize scene
        
         
    };

    Scene.prototype.update = function(){
       
        this.player && this.player.update(this.map.barriers, this.map.boundary);
    };

    Scene.prototype.onkeydown = function(keyCode){

        this.player && this.player.onkeydown(keyCode);
    };

    Scene.prototype.onkeyup = function(keyCode){

        this.player && this.player.onkeyup(keyCode);

    };

    Scene.prototype.resizeScene = function(){
        console.log('resizeScene');

        var adjust = {
            ratio: 1,
            offset: 0
        };
        if(this.mapData){
            var actualWidth = this.mapData.width * this.mapData.tilewidth * this.mapData.adjust.content;
            var offset = this.mapData.width * this.mapData.tilewidth * this.mapData.adjust.start;
            adjust.ratio = window.innerWidth / actualWidth;
            adjust.offset = offset;
            adjust.center = this.mapData.adjust.center;
        }      
        console.log("adjust.offset", adjust.offset, adjust.center);


        var offsetX = 0;
        this.container.scale.x = adjust.ratio;
        this.container.scale.y = adjust.ratio;
        if(adjust.center){
            console.log('container width', this.container.width);
            offsetX = (window.innerWidth - this.container.width) / 2;
        } else{
            offsetX = adjust.offset;
        }
        console.log("offsetX", offsetX);
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
        console.log('addWalkin', obj, this.player);

        if(obj.type === "mark"){
            if(obj.name === "exit"){
                obj.args = { mapName: obj.properties.nextMap };
                obj.callback = this.goToMap.bind(this);
            }
        }

        this.player.addWalkinObj(obj);

    };

    Scene.prototype.goToMap = function(args) {
        console.log('goToMap', args, this);

    };

 


    

    return Scene;

});

