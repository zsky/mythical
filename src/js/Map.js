define(['lib/pixi'], function (PIXI) {

    var Map = function(bgContainer, topContainer, scene){
        this.bgContainer = bgContainer;
        this.topContainer = topContainer;
        this.scene = scene;

        this.loaded = false;

    };

    Map.prototype.clearMap = function(){
        this.barriers = [];
        this.scene.clearWalkinobjs();
        var layers = [this.bgContainer, this.topContainer];
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            for (var j = layer.children.length - 1; j >= 0; j--) {
                layer.removeChild(layer.children[j]);
            };
        }
    };

    

    Map.prototype.drawAll = function(){

        this.clearMap();

        // draw layer data

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

        this.loaded = true;
        this.scene.setRoleData({barriers: this.barriers});

      
         
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
                var g = new PIXI.Graphics();
                g.lineStyle(1, 0x0393FF, 1);
                g.drawRect(obj.x, obj.y, obj.width, obj.height);
                this.scene.addWalkin(obj);
                container.addChild(g);
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