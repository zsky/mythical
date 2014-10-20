define(['lib/pixi', 'Map', 'Role', "Enemy", "Battle"], function (PIXI, Map, Role, Enemy, Battle) {

    var Scene = function(container, app){

        this.container = container;
        this.app = app;


        // consts
        this.MOVE_STEP = 80;
        
        // default
        this.enemies = [];
        this.init();

    };

    Scene.prototype.init = function(){
        /*
        layer[0]: bg,  layer[1]: player, layer[2]: 遮挡人物的物品, layer[3]: battle 
        */
        this.layer = [];
        for(var i = 0; i < 4; i++){
            this.layer[i] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.layer[i]);
        }


        this.dialogBox = document.getElementById("dialogBox");

        this.player = new Role(this.layer[1], this);
        this.map = new Map(this.layer[0], this.layer[2], this);

        this.container.interactive = true;
        //this.container.click = this.player.moveToIt.bind(this.player);

    };

    Scene.prototype.setEnemiesJson = function(data) {
        this.enemiesJson = data;
    };

    Scene.prototype.loadStoryData = function(name) {

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

        var boundary = {
            width: this.mapData.width * this.mapData.tilewidth,
            height: this.mapData.height * this.mapData.tileheight
        }

        this.player.setBoundary(boundary);

        console.log("data loaded, TextureCache", PIXI.TextureCache);

        this.app.system.hideLoading(function(){
            console.log("callback do nothing");
        });
        this.enter();  // enter the scene

    };

    Scene.prototype.loadTileset = function(tileset, image){
        console.log('loadTileset', this, tileset);
        
        var baseTexture = image.texture.baseTexture;
        var widthNum = Math.floor(tileset.imagewidth/tileset.tilewidth);
        var heightNum = Math.floor(tileset.imageheight/tileset.tileheight);
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

        this.map.drawAll(this.name, this.mapData);

        this.enemies = [];
        if(this.storyData.enemy){
            for(var i = 0; i < this.storyData.enemy.length; i++){
                var enemyData = this.storyData.enemy[i];
                enemyData.textureData = this.enemiesJson.textureDatas[enemyData.textureIndex];
                enemyData.ways = this.enemiesJson.waysDatas[enemyData.waysIndex];
                var enemy = new Enemy(this.layer[0], enemyData, this);
                enemy.goAround();
                this.enemies.push(enemy);

            }
        }

        // just for test
        /*var battleData = {
            "enemyNum": 3,
            "enemies": [
                ["e1", 3]
            ],
            "gain": [
                [["coin", "coin", 9], ["goods", "HP1", 2], ["goods", "HP2", 2]],
                [["coin", "coin", 5], ["goods", "HP1", 3], ["goods", "HP2", 1]]
            ]
        }
        this.app.toBattle(battleData);*/


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
       
        this.player.update();
    };

    Scene.prototype.getEnemies = function() {
        return this.enemies;
    };
    Scene.prototype.removeEnemy = function(enemy) {
        console.info("scene removeEnemy", enemy, "this.enemies", this.enemies, "equal?", enemy === this.enemies[0]);
        for(var i = this.enemies.length - 1; i > 0; i--){
            var e = this.enemies[i];
            if(e === enemy) {
                this.enemies.splice(i, 1);
                if(this.enemies.length < 1) console.log("enemies are all dead");
                return;
            }
        }
    };

    Scene.prototype.toBattle = function(battleData) {
        this.mode = "battle";
        this.tempPos = {
            x: this.container.x,
            y: this.container.y
        }
        this.container.x = 0;
        this.container.y = 0;
        this.app.hideAvatar();
        console.log("scene.js to battle", battleData);
        this.battle.enter(battleData);
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

        this.player.addWalkinObj(obj);

    };

    Scene.prototype.clearScene = function() {
        // clear
        this.player.walkinObjs = [];
        this.container.x = 0;
        this.container.y = 0;
        this.map.clearMap();
        this.mapData = null;
        this.storyData = null;
    };

    Scene.prototype.goToMap = function(mapName) {

        console.log('goToMap', mapName);
        this.clearScene();

        this.name = mapName;
        this.loadStoryData(mapName);

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


    Scene.prototype.getPlayerData = function() {
        var playerData = this.player.playerData;
        playerData.x = this.player.x;
        playerData.y = this.player.y;
        playerData.mapName = this.name;
        playerData.displayName = this.storyData.displayName;
        return playerData;
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
            console.log("check player", this.player.x, this.player.y);
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




    

    return Scene;

});

