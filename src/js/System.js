define(['lib/pixi'], function (PIXI) {

    var System = function(app){

        this.app = app;
        this.sys = [];

        this.resizeable = false;

        this.init();

        this.RECORD_NUM = 10;


    };

    System.prototype.init = function() {
        this.loadSysData();

        var sysNames = ["intro", "mainMenu", "avatar", "sysMenu", "roleData", "goods", "record"];
        for(var i = 0; i < sysNames.length; i++){
            var name = sysNames[i];
            this.sys[name] = document.getElementById(name);
        }

        var menuNames = ["menuRecord", "menuStart", "avatarImg", "toRoleData", "toGoods"];
        for(var i = 0; i < menuNames.length; i++){
            var name = menuNames[i];
            var menu = document.getElementById(name);
            menu.addEventListener("click", this.bindEvent(name), false);
        }
    };

    System.prototype.showIntro = function() {
        this.state = "intro";
        this.sys["intro"].style.display = "block";
        this.sys["intro"].style.backgroundPositionX = "100%";
        this.introMoving = true;        
    };

    System.prototype.showAvatar = function() {
        this.sys["avatar"].style.display = "block";

        this.sys["record"].style.display = "none";
        var playerData = this.gameData.playersAttr[0];
        var rankSpan = this.sys["avatar"].getElementsByClassName("rank")[0];
        rankSpan.innerHTML = playerData.rank;
        var hpDiv = this.sys["avatar"].getElementsByClassName("HP")[0];
        var mpDiv = this.sys["avatar"].getElementsByClassName("MP")[0];
        var expDiv = this.sys["avatar"].getElementsByClassName("EXP")[0];

        hpDiv.style.width = playerData.HP + "px";
        mpDiv.style.width = playerData.MP + "px";
        expDiv.style.width = playerData.EXP + "px";

        
    };

    System.prototype.showMainMenu = function() {
        this.state = "mainMenu";

        this.sys["mainMenu"].style.display = "block";


    };

    System.prototype.showSysMenu = function() {

        this.state = "sysMenu";
        this.sys["sysMenu"].style.display = "block";
        var playerData = this.gameData.playersAttr[0];
        var coinSpan = this.sys["sysMenu"].getElementsByClassName("coin")[0];
        coinSpan.innerHTML = playerData.coin;       
        // default
        //this.showRoleData();
        //this.showGoods();
    };

    System.prototype.showRoleData = function() {
        if(this.currLayer) { this.currLayer.style.display = "none"; }
        this.sys["roleData"].style.display = "block";
        this.currLayer = this.sys["roleData"];

        var playerData = this.gameData.playersAttr[0];
        var rankSpan = this.sys["roleData"].getElementsByClassName("rank")[0];
        rankSpan.innerHTML = playerData.rank;
        var hpDiv = this.sys["roleData"].getElementsByClassName("HP")[0];
        var mpDiv = this.sys["roleData"].getElementsByClassName("MP")[0];
        var expDiv = this.sys["roleData"].getElementsByClassName("EXP")[0];

        hpDiv.style.width = playerData.HP + "px";
        mpDiv.style.width = playerData.MP + "px";
        expDiv.style.width = playerData.EXP + "px";
        

    };



    System.prototype.showGoods = function() {
        if(this.currLayer){ this.currLayer.style.display = "none"; }
        this.sys["goods"].style.display = "block";
        this.currLayer = this.sys["goods"];

        if(!this.sys["goods"].dataset.updated){
            var iconImg = this.sys["goods"].getElementsByClassName("icon")[0];
            var detailDiv = this.sys["goods"].getElementsByClassName("detail")[0];
            var goodsList = this.sys["goods"].getElementsByClassName("list")[0];

            console.log("detailsJson", this.detailsJson);

            var goodsData = this.gameData.goods;
            for(var i = 0; i < goodsData.length; i++){
                var data = goodsData[i];
                var detail = this.detailsJson.goods[data.id];
                var element = document.createElement('li'); 
                element.className = "goodsItem";
                element.addEventListener("click", this.showItem(detailDiv, iconImg, detail), false);
                element.innerHTML = "<span>" + detail.name + "</span>" + "<span>" + data.num + "</span>";
                goodsList.appendChild(element);
            }
            this.sys["goods"].dataset.updated = true;
        }

        
    };
    System.prototype.showItem = function(detailDiv, iconImg, detail) {
        return function(){
            detailDiv.innerHTML = detail.describe;
            iconImg.src = "resource/system/goods/" + detail.icon;
        }
    };

    System.prototype.showRecord = function(authority) {
        this.sys["sysMenu"].style.display = "none";
        this.sys["record"].style.display = "block";

        this.state = "record";

        var recordList = this.sys["record"].getElementsByClassName("list")[0];

        this.sys["record"].dataset.authority = authority;

        if(!this.sys["record"].dataset.created){
            for(var i = 0; i < this.RECORD_NUM; i++){
                var element = document.createElement('div'); 
                element.addEventListener("click", this.recordEvent(i).bind(this), false);
                element.className = "recordItem";
                element.id = "record" + i;
                recordList.appendChild(element);
                var span = document.createElement('span'); 
                span.className = "recordNum";
                span.innerHTML = i;
                element.appendChild(span);

                var mapName = document.createElement('div'); 
                mapName.className = "recordMapName";
                element.appendChild(mapName);

                var saveTime = document.createElement('div'); 
                saveTime.className = "recordTime";
                element.appendChild(saveTime);

            }
            this.sys["record"].dataset.created = true;
        }

        if(!this.sys["record"].dataset.updated){
            for(var i = 0; i < this.RECORD_NUM; i++){
                var data = this.app.record.getData(i);
                if(data){
                    this.updateRecordView(data, i);
                }

            }
            this.sys["record"].dataset.updated = true;
        }
    };
    System.prototype.recordEvent = function(i) {
        return function(){
            if(this.sys["record"].dataset.authority === "W"){
                this.writeRecord(i);
            }else{
                this.readRecord(i);
            }
        }
    };
    System.prototype.writeRecord = function(id){
        console.log("writeRecord", id);
        var data = this.gameData;
        data.player = this.app.getPlayerData();

        this.updateRecordView(data, id);

        
        this.app.saveData(data, id);
    };
    System.prototype.readRecord = function(id) {
        this.app.readRecord(id);
    };
    System.prototype.updateRecordView = function(data, id) {
        console.log("updateRecordView", data);
        var recordDiv = document.getElementById("record" + id);
        var mapName = recordDiv.getElementsByClassName("recordMapName")[0];
        var saveTime = recordDiv.getElementsByClassName("recordTime")[0];

        mapName.innerHTML = data.player.displayName;
        var now = new Date();
        saveTime.innerHTML = JSON.stringify(now);
    };

    System.prototype.bindEvent = function(command){
        var that = this;
        return function(){
            that.execCommand(command);
        }

    };

    System.prototype.execCommand = function(command) {
        console.log("system execCommand", command);
        switch(command){
            case "menuStart":
                this.sys["mainMenu"].style.display = "none";
                this.app.newGame();
                break;
            case "menuRecord":
                this.sys["mainMenu"].style.display = "none";
                this.showRecord("R");
                break;
            case "avatarImg":
                this.sys["avatar"].style.display = "none";
                this.app.mode = "system";
                this.showSysMenu();
                break;
            case "toRoleData":
                this.showRoleData();
                break;
            case "toGoods":
                this.showGoods();
                break;
           
        }
    };


    System.prototype.update = function() {
        this.introMoving && this.moveIntro();
    };


    System.prototype.moveIntro = function() {

        var prev = this.sys["intro"].style.backgroundPositionX.slice(0, -1);
        this.sys["intro"].style.backgroundPositionX = (prev - 0.04) + "%";

    };

    System.prototype.onkeydown = function(keyCode){

        switch(keyCode){
            case 27:
                if(this.state === "intro"){
                    this.sys["intro"].style.display = "none";
                    this.introMoving = false;
                    this.showMainMenu();
                    this.state = "";
                }else if(this.state === "sysMenu"){
                    this.sys["sysMenu"].style.display = "none";
                    this.showAvatar();
                    this.app.mode = "normal";
                    this.state = ""; 
                }else if(this.state === "record"){
                    this.sys["record"].style.display = "none";
                    this.showAvatar();
                    this.app.mode = "normal";
                    this.state = "";
                }             
                break;
        }

    };

    System.prototype.onkeyup = function(keyCode){


    };

    System.prototype.loadSysData = function() {

        var sysLoader = new PIXI.JsonLoader("resource/system/details.json", false);
        sysLoader.on("loaded", this.onSysDataLoaded.bind(this));
        sysLoader.load(); 
    };
    System.prototype.onSysDataLoaded = function(data) {
        console.log("sys data loaded", data);
        this.detailsJson = data.content.json;   

    };

    return System;

});