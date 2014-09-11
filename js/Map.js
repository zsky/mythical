define(['lib/pixi'], function (PIXI) {

    var Map = function(name, bgContainer, topContainer, scene){
        this.name = name;
        this.bgContainer = bgContainer;
        this.topContainer = topContainer;
        this.scene = scene;
        this.boundary = {};

    };
    Map.prototype.init = function() {


        var dataLoader = new PIXI.JsonLoader("resource/map/" + this.name + ".json", false);
        dataLoader.on("loaded", this.onJsonLoaded.bind(this));
        dataLoader.load(); 
      
         
    };
    Map.prototype.onJsonLoaded = function(data) {
        console.log('onJsonLoaded', this, data.content.json);

        this.json = data.content.json;
        var baseImageUrl = "resource/map/";
        
        // load image data
        for(var i = 0; i < this.json.tilesets.length; i++){
            var tileset = this.json.tilesets[i];
         
            var image = new PIXI.ImageLoader(baseImageUrl + tileset.image);
            image.on("loaded", function(){
                console.log('image loaded');
            });

            this.loadTileset(tileset, image);


            image.load();

        }


        // load layer data
        for(var j = 0; j < this.json.layers.length; j++){
            var layer = this.json.layers[j];
            if(layer.type === "tilelayer" && j === 0){
                this.drawLayerData(layer, this.bgContainer);
            } else if(layer.type === "tilelayer" && j === 1){
                this.drawLayerData(layer, this.topContainer);
            } else if(layer.type === "objectgroup" && layer.name === "collision"){
                console.log('objectgroup', layer.objects, layer);
                this.barriers = layer.objects;
                this.drawCollData(layer.objects, this.topContainer);
            } else if(layer.type === "objectgroup" && layer.name === "event"){
                console.log("event layer");
                this.drawEventData(layer.objects, this.topContainer);
            }
            
        }
        console.log('resizeMap again');

        this.boundary = {
            width: this.json.width * this.json.tilewidth,
            height: this.json.height * this.json.tileheight
        }

        this.resizeMap();



    };

    Map.prototype.loadTileset = function(tileset, image){
        console.log('loadTileset', this, tileset);
        
        var baseTexture = image.texture.baseTexture;
        var widthNum = Math.floor(tileset.imagewidth/tileset.tilewidth);
        var heightNum = Math.floor(tileset.imageheight/tileset.tileheight);
        console.log('widthNum', widthNum, heightNum);
        for(var i = 0; i < widthNum; i++){
            for(var j = 0; j < heightNum; j++){
                var textureName = this.name + (tileset.firstgid + j*widthNum + i);

                if(i < 2){
                    //console.log('textureName', textureName);
                }

                PIXI.TextureCache[textureName] = new PIXI.Texture(baseTexture, {
                                            x: i*tileset.tilewidth,
                                            y: j*tileset.tileheight,
                                            width: tileset.tilewidth,
                                            height: tileset.tileheight
                                        });

            }
        }




    };

    Map.prototype.resizeMap  = function(){
        var adjust = {};
        if(this.json){
            var actualWidth = this.json.width * this.json.tilewidth * this.json.adjust.content;
            var offset = this.json.width * this.json.tilewidth * this.json.adjust.start;
            adjust.ratio = window.innerWidth / actualWidth;
            adjust.offset = offset;
            adjust.center = this.json.adjust.center;
        } else{
            adjust.ratio = 1;
            adjust.offset = 0;
        }        

        return adjust;

    };

    Map.prototype.drawLayerData = function(layer, container){
        console.log('drawLayerData', layer);
        var data = layer.data;
        container.alpha = layer.opacity;
        container.visible = layer.visible;
        container.x = layer.x;
        container.y = layer.y;

        for(var i = 0; i < layer.width; i++){
            for(var j = 0; j < layer.height; j++){
                var num = j * layer.width + i;
                try{
                    var tileMap = PIXI.Sprite.fromFrame(this.name + data[num]);
                }
                catch(err){
                    continue;
                }

                tileMap.position.x = i * this.json.tilewidth;
                tileMap.position.y = j * this.json.tileheight;
                container.addChild(tileMap);
            }

        }

    };

    Map.prototype.drawCollData = function(objects, container){
        console.log('drawCollData', objects);

        var graphics = new PIXI.Graphics();
        graphics.lineStyle(1, 0x0000FF, 1);
        for(var i = 0; i < objects.length; i++){
            var obj = objects[i];
            if(obj.ellipse){
                //graphics.beginFill(0xFFFF0B, 0.5);
                var r = obj.width/2;
                graphics.drawCircle(obj.x + r, obj.y + r, r);
                //graphics.endFill();
            } else{
                graphics.drawRect(obj.x, obj.y, obj.width, obj.height);
            }
            
        }

        container.addChild(graphics);

    };

    Map.prototype.drawEventData = function(objects, container) {
        for(var i = 0; i < objects.length; i++){
            var obj = objects[i];
            if(obj.gid){
                var item = PIXI.Sprite.fromFrame(this.name + obj.gid);
                item.position.x = obj.x;
                item.position.y = obj.y;
                item.setInteractive(true);
                item.click = this.bindEvent(obj.type, obj.name);
                container.addChild(item);

            } else{
                this.scene.addWalkin(obj);
            }
        }
    };

    Map.prototype.bindEvent = function(type, name){
        var that = this;
        return function() {
            that.scene.sayWords(type, name);
        }
    };




    return Map;

});