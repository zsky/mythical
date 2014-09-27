define(['lib/pixi'], function (PIXI) {

    var System = function(container, app){

        this.container = container;
        this.app = app;

        this.menus = [];

        this.resizeable = true;


    };

    System.prototype.showAvatar = function(data) {
        if(this.menus["avatar"]){

        } else{
            this.menus["avatar"] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.menus["avatar"]);
            var img = new PIXI.Sprite.fromImage(data.imgPath);
            img.width = 70;
            img.height = 70;
            this.menus["avatar"].addChild(img);

            var rankText = new PIXI.Text(data.rank);
            rankText.position.x = 10;
            rankText.position.y = 70;
            this.menus["avatar"].addChild(rankText);

            var valueGraph = new PIXI.Graphics();
            //valueGraph.lineStyle(2, 0x0000FF, 1);
            valueGraph.beginFill(0x0000FF, 1);
            valueGraph.drawRect(50, 250, 100, 100);
            valueGraph.endFill();

            this.menus["avatar"].addChild(valueGraph);

        }

        
    };

    System.prototype.showMenu = function(name) {
        console.log("System showMenu");
        if(this.menus[name]){

        } else{
            this.name = name;
            this.loadData(name);
        }

    };

    System.prototype.loadData = function(name) {

        /*this.loading = new PIXI.Sprite.fromImage("resource/img/loading.gif");
        this.layer[3].addChild(this.loading);*/

        var loader = new PIXI.JsonLoader("resource/system/" + name + ".json", false);
        loader.on("loaded", this.onDataLoaded.bind(this));
        loader.load();
    };

    System.prototype.onDataLoaded = function(data) {
        console.log('system data loaded');
        this.json = data.content.json;

        this.menus[this.name] = new PIXI.DisplayObjectContainer();
        this.currlayer = this.menus[this.name];
        this.container.addChild(this.currlayer);
        console.log("menu path", this.json);

        var bg = new PIXI.Sprite.fromImage(this.json.directory + this.json.bg);
        this.currlayer.addChild(bg);

        for(var i = 0; i < this.json.items.length; i++){
            var item = this.json.items[i];
            var itemImg = new PIXI.Sprite.fromImage(this.json.directory + item.name);
            itemImg.position.x = item.posX;
            itemImg.position.y = item.posY;
            this.currlayer.addChild(itemImg);
            if(item.command){
                itemImg.interactive = true;
                itemImg.click = this.bindEvent(item.command, "click");
            }

        }

        this.resizeSys();

         

    };

    System.prototype.bindEvent = function(command, eventType){
        var that = this;
        return function(){
            that.execCommand(command);
        }

    };

    System.prototype.execCommand = function(command) {
        console.log("system execCommand", command);
        switch(command){
            case "newGame":
                this.currlayer.visible = false;
                this.app.newGame();
                this.resizeable = false;
                break;
        }
    };

    System.prototype.resizeSys = function(){
        if(!this.resizeable)  return;
        console.log('resizeSys');
        
 
        var transform = {
            ratio: 1,
            offset: {
                x: 0,
                y: 0
            }
        };

        if(this.json){
            var adjust = this.json.adjust;
            var actualHeight = this.json.imgHeight * adjust.contentY;
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


    return System;

});