define(['lib/pixi'], function (PIXI) {

    var System = function(container, app){

        this.container = container;
        this.app = app;

        this.sys = [];

        this.resizeable = false;


    };

    System.prototype.showIntro = function() {
        this.state = "intro";
        if(!this.sys["intro"]){
            this.loadData("intro");
        }else if(this.sys["intro"].layer){

        }else if(this.sys["intro"].data){
            var data = this.sys["intro"].data;
            this.sys["intro"].layer = new PIXI.DisplayObjectContainer();
            var layer = this.sys["intro"].layer
            this.container.addChild(layer);

            var bg = new PIXI.Sprite.fromImage(data.directory + data.bg);
            layer.addChild(bg);
            this.resizeable = true;
            this.adjust = data.adjust;

            this.introMoving= true;
            this.resizeSys();

        }
        
    };

    System.prototype.showAvatar = function(data) {
        if(this.sys["avatar"]){

        } else{
            this.sys["avatar"] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.sys["avatar"]);
            var img = new PIXI.Sprite.fromImage(data.imgPath);
            img.width = 70;
            img.height = 70;
            img.interactive = true;
            img.click = this.showSysMenu.bind(this);
            this.sys["avatar"].addChild(img);

            var rankText = new PIXI.Text(data.rank);
            rankText.position.x = 10;
            rankText.position.y = 70;
            this.sys["avatar"].addChild(rankText);

            var valueGraph = new PIXI.Graphics();
            //valueGraph.lineStyle(2, 0x0000FF, 1);
            valueGraph.beginFill(0xFF0000, 1);
            valueGraph.drawRect(70, 10, data.HP, 10);

            valueGraph.beginFill(0x0000FF, 1);
            valueGraph.drawRect(70, 30, data.MP, 10);

            valueGraph.beginFill(0xF0F0F, 1);
            valueGraph.drawRect(70, 50, data.EXP, 10);
            valueGraph.endFill();

            this.sys["avatar"].addChild(valueGraph);

        }

        
    };



    System.prototype.showMainMenu = function() {
        this.state = "mainMenu";

        if(!this.sys["mainMenu"]){
            this.loadData("mainMenu");
        }else if(this.sys["mainMenu"].layer){

        }else if(this.sys["mainMenu"].data){
            var data = this.sys["mainMenu"].data;
            this.sys["mainMenu"].layer = new PIXI.DisplayObjectContainer();
            var layer = this.sys["mainMenu"].layer
            this.container.addChild(layer);

            var bg = new PIXI.Sprite.fromImage(data.directory + data.bg);
            layer.addChild(bg);

            for(var i = 0; i < data.items.length; i++){
                var item = data.items[i];
                var itemImg = new PIXI.Sprite.fromImage(data.directory + item.name);
                itemImg.position.x = item.posX;
                itemImg.position.y = item.posY;
                layer.addChild(itemImg);
                if(item.command){
                    itemImg.interactive = true;
                    itemImg.click = this.bindEvent(item.command, "click");
                }

            }

            this.resizeable = true;
            this.adjust = data.adjust;

            this.resizeSys();


        }


    };

    System.prototype.showSysMenu = function() {
        if(this.sys["avatar"]) { this.sys["avatar"].visible = false; }

        if(this.sys["menuBg"]){
            this.sys["menuBg"].visible = true;
        }else{
            this.sys["menuBg"] = new PIXI.Sprite.fromImage("resource/system/roleData/bg.png");
            this.container.addChild(this.sys["menuBg"]);
        }

        this.resizeable = true;
        this.adjust = {
            imgHeight: 261,
            contentY: 1,
            start: {
                x: 0,
                y: 0
            }
        }
        this.resizeSys();

        this.showRoleData();
        this.showNav();
    };

    System.prototype.showNav = function() {
        console.log("showNav");
        if(this.sys["nav"]){
            this.sys["nav"].visible = true;
        }else {
            this.sys["nav"] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.sys["nav"]);

            var menuRole = new PIXI.Sprite.fromImage("resource/system/nav/role.png");
            menuRole.width = menuRole.height  = 32;
            menuRole.position.x = 320;
            menuRole.position.y = 60;
            menuRole.interactive = true;
            menuRole.click = this.showRoleData.bind(this);
            this.sys["nav"].addChild(menuRole);

            var menuGoods = new PIXI.Sprite.fromImage("resource/system/nav/goods.png");
            menuGoods.width = menuGoods.height  = 32;
            menuGoods.position.x = 320;
            menuGoods.position.y = 95;
            menuGoods.interactive = true;
            menuGoods.click = this.showGoods.bind(this);
            this.sys["nav"].addChild(menuGoods);

            var menuEquip = new PIXI.Sprite.fromImage("resource/system/nav/equip.png");
            menuEquip.width = menuEquip.height  = 32;
            menuEquip.position.x = 320;
            menuEquip.position.y = 130;
            this.sys["nav"].addChild(menuEquip);

            var menuTask = new PIXI.Sprite.fromImage("resource/system/nav/task.png");
            menuTask.width = menuTask.height  = 32;
            menuTask.position.x = 320;
            menuTask.position.y = 165;
            this.sys["nav"].addChild(menuTask);
        }
    };

    System.prototype.showRoleData = function() {
        console.log("showRoleData", this.gameData); 
        if(this.currLayer){ this.currLayer.visible = false; }

        if(this.sys["roleData"]){
            this.currLayer = this.sys["roleData"];
            this.currLayer.visible = true;
        }else {
            this.currLayer = this.sys["roleData"] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.sys["roleData"]);       

            var qiangu = new PIXI.Sprite.fromImage("resource/system/roleData/qiangu.jpg");
            qiangu.scale.x = qiangu.scale.y = 0.6;
            qiangu.position.x = qiangu.position.y = 50;
            this.sys["roleData"].addChild(qiangu);

            var playerData = this.gameData.player.properties;
            var info = "HP:" + playerData.HP + "\nMP:" + playerData.MP;
            var infoText = new PIXI.Text(info);
            infoText.position.x = 190;
            infoText.position.y = 50;
            this.sys["roleData"].addChild(infoText);

        }

    };



    System.prototype.showGoods = function() {

        console.log("showGoods", this.gameData);
        if(this.currLayer){ this.currLayer.visible = false; }
        if(this.sys["goods"]){
            this.currLayer = this.sys["goods"];
            this.currLayer.visible = true;
        }else {
            this.currLayer = this.sys["goods"] = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.sys["goods"]);       

            var goodsData = this.gameData.goods;
            var info = "num:" + goodsData.num;
            var infoText = new PIXI.Text(info);
            infoText.position.x = 190;
            infoText.position.y = 50;
            this.sys["goods"].addChild(infoText);
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
        var json = data.content.json;

        switch(json.name){
            case "intro":
                this.sys["intro"] = {
                    data: json 
                }
                this.showIntro();
                break;
            case "mainMenu":
                this.sys["mainMenu"] = {
                    data: json 
                }
                this.showMainMenu();
                break;
        }     

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
                this.sys["mainMenu"].layer.visible = false;
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


        var adjust = this.adjust;
        var actualHeight = adjust.imgHeight * adjust.contentY;
        transform.ratio = window.innerHeight / actualHeight;
        this.container.scale.x = transform.ratio;
        this.container.scale.y = transform.ratio;

        transform.offset = adjust.start;

        if(adjust.centerX){
            transform.offset.x = (window.innerWidth - this.container.width) / 2;
        } else if(adjust.rightX){
            transform.offset.x = window.innerWidth - adjust.imgWidth * transform.ratio;
        }

        this.container.x = transform.offset.x;
        this.container.y = transform.offset.y;  


    };

    System.prototype.update = function() {
        this.introMoving && this.moveIntro();
    };


    System.prototype.moveIntro = function() {

        var data = this.sys["intro"].data;


        switch(data.dire){
            case "L": 
                if(this.container.x > 0) return false;
                this.container.x += data.speed * this.container.scale.x;
                break;
        }

    };

    System.prototype.onkeydown = function(keyCode){

        switch(keyCode){
            case 27:
                if(this.state === "intro"){
                    if(this.sys["intro"] && this.sys["intro"].layer){
                        this.sys["intro"].layer.visible = false;
                    }
                    this.introMoving = false;
                    this.container.x = 0;
                    this.container.y = 0;
                    this.showMainMenu();
                }
                
                break;
        }

    };

    System.prototype.onkeyup = function(keyCode){


    };

    return System;

});