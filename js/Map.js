define(['lib/pixi'], function (PIXI) {

    var Map = function(name, bgContainer){
        this.name = name;
        this.bgContainer = bgContainer;

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

        // laod layer data
        for(var j = 0; j < this.json.layers.length; j++){
            var layer = this.json.layers[j];
            if(layer.type === "tilelayer"){
                this.drawLayerData(layer);
            }
            
        }


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
                    console.log('textureName', textureName);
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

    Map.prototype.drawLayerData = function(layer){
        console.log('drawLayerData', layer);
        var data = layer.data;
        var container = new PIXI.DisplayObjectContainer();
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

        this.bgContainer.addChild(container);

    };





    return Map;

});