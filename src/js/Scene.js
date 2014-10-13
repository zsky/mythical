define(['lib/pixi', 'Map', 'Role', "Enemy", "Battle"], function (PIXI, Map, Role, Enemy, Battle) {

    var Scene = function(container, app){

        this.container = container;
        this.app = app;

        this.MOVE_STEP = 80;
        
        this.enemies = [];
        this.init();

    };

    Scene.prototype.init = function(){
        this.layer = [];
        for(var i = 0; i < 4; i++){
            this.layer[i] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.layer[i]);
        }
        /*
        layer[0]: bg,  layer[1]: player, layer[2]: 遮挡人物的物品, layer[3]: battle 
        */

        this.dialogBox = document.getElementById("dialogBox");

        this.player = new Role(this.layer[1], this);
        this.map = new Map(this.layer[0], this.layer[2], this);
        this.battle = new Battle(this.layer[3], this);

        this.container.interactive = true;
        //this.container.click = this.player.moveToIt.bind(this.player);

    };

    Scene.prototype.loadStoryData = function(name) {

        //this.mode = "loading";
        this.app.system.showLoading();

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

        //this.layer[3].removeChild(this.loading);

        var boundary = {
            width: this.mapData.width * this.mapData.tilewidth,
            height: this.mapData.height * this.mapData.tileheight
        }
        this.setData(this.player, {boundary: boundary});

        console.log("data loaded, TextureCache", PIXI.TextureCache);
        //this.mode = "normal";
        this.app.system.hideLoading();
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

        this.enemies = [];
        if(this.storyData.enemy){
            for(var i = 0; i < this.storyData.enemy.length; i++){
                var enemyData = this.storyData.enemy[i];
                var enemy = new Enemy(this.layer[0], enemyData);
                enemy.animate();
                this.enemies.push(enemy);

            }
        }


        this.resizeScene();  // resize scene
             
         
    };

    Scene.prototype.update = function(){

        if(this.mode === "battle"){
            this.battle.update();
            return;
        };

        for(var i = 0; i < this.enemies.length; i++){
            var enemy = this.enemies[i];
            enemy.update();
        }
       
        this.map.loaded && this.player.update();
    };

    Scene.prototype.getEnemies = function() {
        return this.enemies;
    };

    Scene.prototype.toBattle = function(battleData) {
        this.mode = "battle";
        this.app.hideAvatar();
        this.battle.enter(battleData);
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
            console.log("check layer[1] children", this.layer[1].children);
            console.log("check layer[2] children", this.layer[2].children);
            console.log("check player", this.player.x, this.player.y);
            console.log("player walkinObjs", this.player.walkinObjs);
            console.log("enemies", this.enemies);
        }
        if(keyCode === 80){  // p
            if(this.layer[2].visible){
                this.layer[2].visible = false;
            }else{ 
                this.layer[2].visible = true;
            }
            console.log('switch top layer');
        }
        if(keyCode === 112){
            this.app.system.showRecord("R");
            this.app.mode = "system";
        }
        if(keyCode === 113){
            this.app.system.showRecord("W");
            this.app.mode = "system";
        }

        console.log("scene onkeydown");


        if(this.mode === "dialog"){
            if(keyCode === 32){
                this.sayWords();
            }else if( keyCode === 27){
                this.currDialog.words = [];
                this.sayWords();
            }
        }else if(this.mode === "battle"){
            this.battle.onkeydown(keyCode);
        }else{
            this.player && this.player.onkeydown(keyCode);
        }

        

    };

    Scene.prototype.onkeyup = function(keyCode){

        this.player && this.player.onkeyup(keyCode);

    };

    Scene.prototype.resizeScene = function(){
        
        if(this.mode === "battle") return;

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

        }        

    };


    Scene.prototype.enterDialog = function(type, name) {
        this.mode = "dialog";
        var npc = this.storyData.npc[name];
        this.currNpc = npc;
        this.currDialog = {
            words: npc.words
        }
        this.sayWords();
    };

    Scene.prototype.sayWords = function(){
        var word = this.currDialog.words.shift();
        console.log("sayWords", word);
        if(word){
            this.dialogBox.innerHTML = word;
            this.dialogBox.style.display = "block";
            //this.dialog.setText(word);
        }else{
            console.log("dialog over");
            this.dialogBox.style.display = "none";
            this.mode = "normal";
            this.app.system.getStuff(this.currNpc.finalGet);
        }
        
    };

    Scene.prototype.addWalkin = function(obj) {
        console.log('addWalkin', obj, this.player);

        if(obj.type === "mark"){
            if(obj.name === "exit"){
                obj.args = { mapName: obj.properties.nextMap, status: obj.properties.status };
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


        if(args.status){
            console.log("update player", args.status);
            this.player.x = args.status.x;
            this.player.y = args.status.y;
            this.player.direction = args.status.dire;
        }

        this.name = args.mapName;
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

    Scene.prototype.initPlayer = function(data) {

        this.player.setData(data);
    };

    Scene.prototype.getPlayerData = function() {
        var playerData = this.player.playerData;
        playerData.x = this.player.x;
        playerData.y = this.player.y;
        playerData.displayName = this.storyData.displayName;
        return playerData;
    };

    

    return Scene;

});

