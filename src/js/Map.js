define(['lib/pixi'], function (PIXI) {

    var Map = function(bgContainer, topContainer, scene){
        this.bgContainer = bgContainer;
        this.topContainer = topContainer;
        this.scene = scene;

        this.loaded = false;

    };

    Map.prototype.clearMap = function(){
        this.barriers = [];
        var layers = [this.bgContainer, this.topContainer];
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            for (var j = layer.children.length - 1; j >= 0; j--) {
                layer.removeChild(layer.children[j]);
            };
        }
    };

    Map.prototype.drawAll = function(name, mapData){

        this.name = name;
        this.json = mapData;

        // draw layer data

        for(var j = 0; j < this.json.layers.length; j++){
            var layer = this.json.layers[j];
            if(layer.type === "tilelayer" && layer.name !== "top"){
                this.drawLayerData(layer, this.bgContainer);
            } else if(layer.type === "tilelayer" && layer.name === "top"){
                this.drawLayerData(layer, this.topContainer);
            } else if(layer.type === "objectgroup" && layer.name === "collision"){
                console.log('objectgroup', layer.objects, layer);
                this.barriers = layer.objects;
                //this.drawCollData(layer.objects, this.topContainer);
            } else if(layer.type === "objectgroup" && layer.name === "event"){
                console.log("event layer");
                this.drawEventData(layer.objects, this.bgContainer);
            }
            
        }

        this.loaded = true;
        this.scene.player.setBarriers(this.barriers);
      
         
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
        var g = new PIXI.Graphics();
        g.lineStyle(1, 0x0393FF, 1);
        for(var i = 0; i < objects.length; i++){
            var obj = objects[i];

            if(obj.type === "mark"){
                
                obj.scope = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
                this.scene.addWalkin(obj);
                obj.args = {
                    mapName: obj.properties.nextMap,
                    pos: obj.properties.pos
                }
                obj.callback = this.bindEvent(obj, "");
            }else{

                this.initDisp(obj, container);

                this.barriers.push({x: obj.x, y: obj.y, width: obj.width, height: obj.height});

                scope = {
                    x: obj.x - obj.width/2,
                    y: obj.y - obj.height/2,
                    width: obj.width*2,
                    height: obj.height*2
                }        
                obj.scope = scope;
                this.scene.addWalkin(obj);
                obj.disp.interactive = true;
                obj.disp.click = this.bindEvent(obj, "click");

                var canvas = document.getElementsByTagName("canvas")[0];

                obj.disp.mouseover = this.bindEvent(obj, "mouseover");
                obj.disp.mouseout = (function(){             
                    return function(){
                        canvas.style.cursor = "default";
                    }
                })();
            }

            g.drawRect(obj.x, obj.y, obj.width, obj.height); 
            g.drawRect(obj.scope.x, obj.scope.y, obj.scope.width, obj.scope.height);

            
        }

        container.addChild(g);

    };

    Map.prototype.bindEvent = function(obj, eventType){
        if(eventType === "mouseover"){
            var canvas = document.getElementsByTagName("canvas")[0];
            return function(){
                console.log("mouseover", obj);
                if(obj.activated){
                    canvas.style.cursor = obj.properties.cursor || "pointer";
                }
            }
        }else{
            var that = this;
            switch(obj.type){
                case "mark":
                    return function(){
                        this.scene.goToMap(obj.args.mapName);
                        this.setPos(obj.args.pos);
                        obj.triggered = true;
                    }
                    break;
                case "goods": 
                    return function() {
                        console.log("click it", "activated", obj.activated);
                        if(!obj.activated) return;
                        if(obj.isAnime) obj.disp.play();
                        obj.activated = false;
                        obj.triggered = true;
                        console.log('gain', obj.properties.gain);
                        that.scene.app.getStuff(obj.properties.gain);
                        
                    }
                    break;
                case "npc":
                    return function() {
                        console.log("click it", "activated", obj.activated);
                        if(!obj.activated) return;
                        if(obj.isAnime) obj.disp.play();
                        obj.activated = false;
                        obj.triggered = true;
                        that.scene.enterDialog(obj.type, obj.name);
                    }
                    break;

            }
        }


    };

    Map.prototype.initDisp = function(obj, container) {
        if(obj.properties.frame_num){
            var image = new PIXI.ImageLoader(obj.properties.src);
            image.on("loaded", function(){
                console.log('image loaded');
            });

            var baseTexture = image.texture.baseTexture;
            var imgWidth = obj.properties.width,
                imgHeight = obj.properties.height;
            var frames = [];
            for(var i = 0; i < obj.properties.frame_num; i++){
                PIXI.TextureCache[obj.name+i] = new PIXI.Texture(baseTexture, {
                                                   x: 0,
                                                   y: i*imgHeight,
                                                   width: imgWidth,
                                                   height: imgHeight
                                               });
                frames.push(PIXI.TextureCache[obj.name+i]);
            };
            obj.disp = new PIXI.MovieClip(frames);
            
            image.load();

            obj.disp.animationSpeed = obj.properties.animationSpeed || 0.2;
            obj.disp.loop = false;
            obj.isAnime = true;
        }else{
            var baseTexture = new PIXI.Texture.fromImage(obj.properties.src);
            PIXI.TextureCache[obj.name+"0"] = new PIXI.Texture(baseTexture, {
                                               x: obj.properties.startX,
                                               y: obj.properties.startY,
                                               width: obj.properties.width,
                                               height: obj.properties.height
                                           });
            obj.disp = new PIXI.Sprite.fromFrame(obj.name+"0");

            obj.isAnime = false;

        }
        obj.disp.position.x = obj.x;
        obj.disp.position.y = obj.y;
        container.addChild(obj.disp);


    };





    return Map;

});