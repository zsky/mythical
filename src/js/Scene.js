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

        this.dialogBox = document.getElementById("dialogBox");


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

        /*this.loading = new PIXI.Sprite.fromImage("resource/img/loading.gif");
        this.layer[3].addChild(this.loading);*/

        var storyLoader = new PIXI.JsonLoader("resource/story/" + name + ".json", false);
        storyLoader.on("loaded", this.onStoryLoaded.bind(this));
        storyLoader.load(); 
    };

    Scene.prototype.onStoryLoaded = function(data) {
        console.log("story data loaded", data);
        this.storyData = data.content.json;

        // load roll img
        if(this.storyData.rollImg){
            this.rollImg = this.storyData.rollImg;
            var img = new PIXI.Sprite.fromImage(this.rollImg.path);
            this.layer[0].addChild(img);
            this.mapData = {
                adjust: this.storyData.adjust,
                tilewidth: 100,
                tileheight: 100,
                width: this.storyData.imgWidth/100,
                height: this.storyData.imgHeight/100
            };

            this.resizeScene();

            this.app.showMenu(this.rollImg.menu);
            this.rollImg = "";
            this.mapData = "";
            this.clearLayers(this.layer);

        }else{
            this.loadMapData(this.storyData.map);
        }
        

         

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

        //this.layer[3].removeChild(this.loading);

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
        this.rollImg && this.moveMap(this.rollImg.dire, this.rollImg.speed);
       
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
            console.log("player walkinObjs", this.player.walkinObjs);
        }
        if(keyCode === 80){  // p
            if(this.layer[2].visible){
                this.layer[2].visible = false;
            }else{ 
                this.layer[2].visible = true;
            }
            console.log('switch top layer');
        }

        console.log("scene onkeydown", this);
        if(keyCode === 27){
            if(this.rollImg){
                console.log("", this.rollImg);
                if(this.rollImg.menu){ 
                    this.app.showMenu(this.rollImg.menu);
                    this.rollImg = "";
                    this.mapData = "";
                    this.clearLayers(this.layer);

                }else{
                    this.goToMap(this.rollImg);
                }

                //
            }
        }

        if(this.mode === "dialog"){
            if(keyCode === 32){
                this.sayWords();

            }
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
            offset: {
                x: 0,
                y: 0
            }
        };

        console.log('haaa', this.container.x, this.container.width);

        if(this.mapData){
            var adjust = this.mapData.adjust;
            var actualHeight = this.mapData.height * this.mapData.tileheight * adjust.contentY;
            transform.ratio = window.innerHeight / actualHeight;
            this.container.scale.x = transform.ratio;
            this.container.scale.y = transform.ratio;

            transform.offset = adjust.start;

            if(adjust.centerX){
                transform.offset.x = (window.innerWidth - this.container.width) / 2;
            } else if(adjust.rightX){
                var mapWidth = this.mapData.width * this.mapData.tilewidth;
                transform.offset.x = window.innerWidth - mapWidth * transform.ratio;
            }

            this.container.x = transform.offset.x;
            this.container.y = transform.offset.y;

            

            
            // ratio
            /*var mapWidth = this.mapData.width * this.mapData.tilewidth; 
            var mapHeight = this.mapData.height * this.mapData.tileheight;
            var actualWidth = mapWidth * adjust.content.x;
            var actualHeight = mapHeight * adjust.content.y;
            transform.ratio = Math.max(window.innerWidth / actualWidth, window.innerHeight / actualHeight);

            this.container.scale.x = transform.ratio;
            this.container.scale.y = transform.ratio;

            if(adjust.center.x){
                transform.offsetX = (window.innerWidth - this.container.width) / 2;
                console.log('transform offsetX', window.innerWidth, this.container.width);
            } else if(adjust.right && adjust.right.x){
                transform.offsetX = window.innerWidth - mapWidth * transform.ratio;
            } else {
                console.log("transform x", mapWidth, adjust.start.x);
                transform.offsetX = -mapWidth * adjust.start.x * transform.ratio;
            }
            if(adjust.center.y){
                transform.offsetY = (window.innerHeight - this.container.height) / 2;
            } else {
                transform.offsetY = -mapHeight * adjust.start.y;
            }

            this.container.x = transform.offsetX;
            this.container.y = transform.offsetY;*/

        }      
        console.log("final transform", transform, this.container.width, this.container.x); 

        return transform;   

    };


    Scene.prototype.enterDialog = function(type, name) {
        this.mode = "dialog";
        var npc = this.storyData.npc[name];
        this.currDialog = {
            words: npc.words
        }
        this.sayWords();
    };

    Scene.prototype.sayWords = function(){
        var word = this.currDialog.words.shift();
        if(word){
            this.dialogBox.innerHTML = word;
            this.dialogBox.style.display = "block";
            //this.dialog.setText(word);
        }else{
            console.log("dialog over");
            this.dialogBox.style.display = "none";
            this.mode = "normal";
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
        // clear scene info
        this.name = args.mapName;
        this.rollImg = "";

        this.loadStoryData(args.mapName);

    };

    Scene.prototype.moveMap = function(dire, speed) {
        //console.log('scene moveMap');
        var step;
        var actualConWidth = this.container.width/this.container.scale.x;
        var actualConHeight = this.container.height/this.container.scale.y;
        switch(dire){
            case "L": 
                if(this.container.x > 0) return false;
                //console.log("moveMap L", this.container.x, speed);
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

    Scene.prototype.clearLayers = function(layers){
        this.container.x = 0;
        this.container.y = 0;
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            for (var j = layer.children.length - 1; j >= 0; j--) {
                layer.removeChild(layer.children[j]);
            };
        }
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

