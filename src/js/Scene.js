define(['lib/pixi', 'Map', 'Role'], function (PIXI, Map, Role) {

    var Scene = function(name, container, app){
        console.log('new scene', container);
        this.name = name;
        this.container = container;
        this.app = app;

        this.MOVE_STEP = 80;
        
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

        this.player = new Role(playerData, this.layer[1], this);
       

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

        var boundary = {
            width: this.mapData.width * this.mapData.tilewidth,
            height: this.mapData.height * this.mapData.tileheight
        }
        this.setData(this.player, {boundary: boundary});

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
        console.log("enter scene");

        this.setData(this.map, {name: this.name, json: this.mapData});
        this.map.drawAll();

        this.resizeScene();  // resize scene


        //this.setData(this.player, {x: transform.offsetX + 50, y: transform.offsetY + 50});
        this.setData(this.player, this.mapData.adjust.player);

        this.player.draw();
       

        
        
         
    };

    Scene.prototype.update = function(){
       
        this.map.loaded && this.player.update();
    };

    Scene.prototype.onkeydown = function(keyCode){
        // check information to debug
        if(keyCode === 81) console.log('check TextureCache', PIXI.TextureCache); //Q
        if(keyCode === 73){  // i
            if(this.layer[0].visible){
                this.layer[0].visible = false;
            }else{ 
                this.layer[0].visible = true;
            }
            console.log('switch bg');
        } 
        if(keyCode === 79){  // o
            console.log("check layer[2] children", this.layer[2].children);
            console.log("check player", this.player.x, this.player.y);
        }
        if(keyCode === 80){  // p
            if(this.layer[2].visible){
                this.layer[2].visible = false;
            }else{ 
                this.layer[2].visible = true;
            }
            console.log('switch top layer');
        }

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

        console.log('haaa', this.container.x, this.container.width);

        if(this.mapData){
            var adjust = this.mapData.adjust;
            // ratio
            var mapWidth = this.mapData.width * this.mapData.tilewidth;  // 640
            var mapHeight = this.mapData.height * this.mapData.tileheight;
            var actualWidth = mapWidth * adjust.content.x;
            var actualHeight = mapHeight * adjust.content.y;
            transform.ratio = Math.max(window.innerWidth / actualWidth, window.innerHeight / actualHeight);

            this.container.scale.x = transform.ratio;
            this.container.scale.y = transform.ratio;

            if(adjust.center.x){
                transform.offsetX = (window.innerWidth - this.container.width) / 2;
                console.log('transform offsetX', window.innerWidth, this.container.width);
            } else {
                transform.offsetX = -mapWidth * adjust.start.x;
            }
            if(adjust.center.y){
                transform.offsetY = (window.innerHeight - this.container.height) / 2;
            } else {
                transform.offsetY = -mapHeight * adjust.start.y;
            }

            this.container.x = transform.offsetX;
            this.container.y = transform.offsetY;

        }      
        console.log("transform", transform); 

        /*var boundary = {};
        console.log('ha', this.container.x, this.container.width/transform.ratio);
        boundary.L = Math.max(-this.container.x, 0);
        boundary.R = Math.min(window.innerWidth-this.container.x, this.container.width/transform.ratio);
        boundary.U = Math.max(-this.container.y, 0);
        boundary.D = Math.min(window.innerHeight-this.container.y, this.container.height/transform.ratio);
        console.log('in resizeScene boundary', boundary);
        this.setData(this.player, {boundary: boundary});*/

        return transform;   

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

    Scene.prototype.clearWalkinobjs = function(){
        this.player.walkinObjs = [];
    };

    Scene.prototype.goToMap = function(args) {
        console.log('goToMap', args, this);
        this.name = args.mapName;
        this.loadStoryData(args.mapName);

    };

    Scene.prototype.moveMap = function(dire, speed) {
        console.log('scene moveMap');
        var step;
        var actualConWidth = this.container.width/this.container.scale.x;
        var actualConHeight = this.container.height/this.container.scale.y;
        switch(dire){
            case "L": 
                if(this.container.x > 0) return false;
                console.log("moveMap L", this.container.x, speed);
                this.container.x += speed * this.container.scale.x;
                break;
            case "U": 
                if(this.container.y > 0) return false;
                //step = Math.min(this.MOVE_STEP, -this.container.x);
                this.container.y += speed * this.container.scale.y;
                break;
            case "R": 
                var dist = (this.container.width + this.container.x) - window.innerWidth;
                if(dist < 0) return false;
                console.log("moveMap R", this.container.x, this.container.width, speed);
                this.container.x -= speed * this.container.scale.x;
                break;
            case "D": 
                var dist = this.container.height + this.container.y - window.innerHeight;
                if(dist < 0) return false;
                //step = Math.min(this.MOVE_STEP, dist);
                this.container.y -= speed * this.container.scale.y;
                break;
        }
        return true;
    };

    Scene.prototype.setRoleData = function(data) {
        this.setData(this.player, data);
    };

 
    Scene.prototype.setData = function(obj, data) {
        console.log("setData", obj, data);
        var key;
        for(key in data){
            obj[key] = data[key];
        }
        console.log("seted", obj);
    };

    

    return Scene;

});

