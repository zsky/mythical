define(['lib/pixi', 'Map', 'Role'], function (PIXI, Map, Role) {

    var Scene = function(name, container, app){
        console.log('new scene', container);
        this.name = name;
        this.container = container;
        this.app = app;
        
        this.init();

    };

    Scene.prototype.init = function(){
        this.layer = [];
        for(var i = 0; i < 4; i++){
            this.layer[i] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.layer[i]);
        }
        /*
        layer[0]: bg,  layer[1]: player, layer[2]: 遮挡人物的物品 layer[3]: 系统层

        */

        // fake player data
        var playerData = {
            properties: {
                x: 200,
                y: 415,
                vX: 3,
                vY: 3
            },
            status: {
                action: "stand",
                direction: "U"
            },
            textureData: {
                actions: ["walkD", "walkL", "walkR", "walkU"],
                imgWidth: 100,
                imgHeight: 100,
                frame_num: 4,
                ratio: 0.5
            }
        }

        this.player = new Role(playerData, this.layer[1]);
       

        this.map = new Map(this.layer[0], this.layer[2], this);

        this.loadStoryData(this.name);

    };

    Scene.prototype.loadStoryData = function(name) {

        this.loading = new PIXI.Sprite.fromImage("resource/img/loading.gif");
        this.layer[3].addChild(this.loading);

        var storyLoader = new PIXI.JsonLoader("resource/story/" + name + ".json", false);
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

        this.layer[3].removeChild(this.loading);

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

    Scene.prototype.enter = function(){

        this.setData(this.map, {name: this.name, json: this.mapData});
        this.map.drawAll();

        this.player.draw();
       

        this.resizeScene();  // resize scene
        
         
    };

    Scene.prototype.update = function(){
       
        this.map.loaded && this.player.update();
    };

    Scene.prototype.onkeydown = function(keyCode){
        if(keyCode === 81) console.log('check TextureCache', PIXI.TextureCache);

        this.player && this.player.onkeydown(keyCode);
    };

    Scene.prototype.onkeyup = function(keyCode){

        this.player && this.player.onkeyup(keyCode);

    };

    Scene.prototype.resizeScene = function(){
        console.log('resizeScene');

        var transform = {
            ratio: 1,
            offsetX: 0,
            offsetY: 0
        };

        if(this.mapData){
            var adjust = this.mapData.adjust;
            // ratio
            var actualWidth = this.mapData.width * this.mapData.tilewidth * adjust.content.x;
            var actualHeight = this.mapData.height * this.mapData.tileheight * adjust.content.y;
            transform.ratio = Math.max(window.innerWidth / actualWidth, window.innerHeight / actualHeight);

            if(adjust.center.x){
                transform.offsetX = (window.innerWidth - this.container.width) / 2;
            } else {
                transform.offsetX = -actualWidth * adjust.start.x;
            }
            if(adjust.center.y){
                transform.offsetY = (window.innerHeight - this.container.height) / 2;
            } else {
                transform.offsetY = -actualHeight * adjust.start.y;
            }

        }      
        console.log("transform", transform);

        this.container.scale.x = transform.ratio;
        this.container.scale.y = transform.ratio;

        this.container.x = transform.offsetX;
        this.container.y = transform.offsetY;

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
        /*this.name = args.mapName;
        this.loadMapData(args.mapName);
        //this.map = new Map(args.mapName, this.mapData, this.layer[0], this.layer[2], this);*/
        this.app.goToScene(args.mapName);

    };

    Scene.prototype.setRoleData = function(data) {
        this.setData(this.player, data);
    };

 
    Scene.prototype.setData = function(obj, data) {
        var key;
        for(key in data){
            obj[key] = data[key];
        }
    };

    

    return Scene;

});

