define(['lib/pixi', 'utils'], function (PIXI, utils) {

    var System = function(app){

        this.app = app;
        this.sys = [];

        this.init();

        // consts
        this.MOVE_INTRO_SPEED = 0.04;
        this.RECORD_NUM = 10;

        this.defaultData = {
            
            playerDisp: {
                x: 200,
                y: 415,
                vX: 1.5,
                vY: 1.5,
                dire: "U",
                mapName: "road",
                textureData: {
                    path: "resource/role/qiangu.png",
                    actions: ["walkD", "walkL", "walkR", "walkU"],
                    imgWidth: 100,
                    imgHeight: 100,
                    frame_num: 4,
                    ratio: 0.5
                }
            },
            playerAttr: {
                basicAttr: {
                    coin: 33,
                    HP: 100,
                    HP_MAX: 120,
                    MP: 100,
                    MP_MAX: 120,
                    EXP: 20,
                    EXP_MAP: 30,
                    rank: 1,
                    avatar: "resource/avatar/qiangu.jpg",
                    figure: "resource/avatar/qiangu.jpg"
                },
                battleAttr: {
                    ATK: 23,
                    DEF: 12,
                    agility: 1,
                    luck: 1
                },
                skills: {
                    "magic0": { rank: 1 }
                }
            },
            common: {
                goods: {
                    "HP1": { num: 2 }
                },
                equipment: {
                    "armor1": { num: 1, used: true, usedFor: "qiangu" }
                },
                task: "task1"
            }

        }


    };

    System.prototype.init = function() {

        var sysNames = ["loading", "intro", "mainMenu", "avatar", "sysMenu", "roleData", "goods", "record"];
        for(var i = 0; i < sysNames.length; i++){
            var name = sysNames[i];
            this.sys[name] = document.getElementById(name);
        }

        var menuNames = ["menuRecord", "menuStart", "avatarImg", "toRoleData", "toGoods", "toRecord"];
        for(var i = 0; i < menuNames.length; i++){
            var name = menuNames[i];
            var menu = document.getElementById(name);
            menu.addEventListener("click", this.bindEvent(name), false);
        }

    };

    System.prototype.setDetailsJson = function(data) {
        console.info("setDetailsJson", data);
        this.detailsJson = data;
    };

    System.prototype.getData = function(id) {
        var data = localStorage.getItem("record" + id);
        if(data) return JSON.parse(data);
        else return "";
    };
    System.prototype.saveData = function(data, id) {
        localStorage.setItem("record" + id, JSON.stringify(data));
    };

    System.prototype.showIntro = function() {
        console.log("system showIntro");
        this.state = "intro";
        this.sys["intro"].style.display = "block";
        this.sys["intro"].style.backgroundPositionX = "100%";
        this.introMoving = true;        
    };
    System.prototype.hideIntro = function() {
        this.sys["intro"].style.display = "none";
        this.introMoving = false;
        this.showMainMenu();
        this.state = "";       
    };

    System.prototype.showAvatar = function() {
        this.sys["avatar"].style.display = "block";

        this.sys["record"].style.display = "none";
        var basicAttr = this.gameData.playerAttr.basicAttr;
        var rankSpan = this.sys["avatar"].getElementsByClassName("rank")[0];
        rankSpan.innerHTML = basicAttr.rank;
        var hpDiv = this.sys["avatar"].getElementsByClassName("HP")[0];
        var mpDiv = this.sys["avatar"].getElementsByClassName("MP")[0];
        var expDiv = this.sys["avatar"].getElementsByClassName("EXP")[0];

        hpDiv.style.width = basicAttr.HP + "px";
        mpDiv.style.width = basicAttr.MP + "px";
        expDiv.style.width = basicAttr.EXP + "px";

        
    };
    System.prototype.hideAvatar = function() {
        this.sys["avatar"].style.display = "none";
    };

    System.prototype.showMainMenu = function() {
        this.state = "mainMenu";

        this.sys["mainMenu"].style.display = "block";


    };

    System.prototype.showLoading = function() {
        this.app.changeMode("system");
        this.sys["loading"].style.display = "block";
    };
    System.prototype.hideLoading = function(callback) {
        var that = this;
        this.sys["loading"].style.opacity = 1;
        utils.hide(this.sys["loading"], function(){
            if(callback){
                callback.apply(that);
            }else{
                that.app.changeMode("normal");
            }
            
        });
    };

    System.prototype.showSysMenu = function() {

        this.state = "sysMenu";
        this.sys["sysMenu"].style.display = "block";
        var basicAttr = this.gameData.playerAttr.basicAttr;
        var coinSpan = this.sys["sysMenu"].getElementsByClassName("coin")[0];
        coinSpan.innerHTML = basicAttr.coin;       
        // default
        this.showRoleData();
    };

    System.prototype.showRoleData = function() {
        if(this.currLayer) { this.currLayer.style.display = "none"; }
        this.sys["roleData"].style.display = "block";
        this.currLayer = this.sys["roleData"];

        var basicAttr = this.gameData.playerAttr.basicAttr;
        var rankSpan = this.sys["roleData"].getElementsByClassName("rank")[0];
        rankSpan.innerHTML = basicAttr.rank;
        var hpDiv = this.sys["roleData"].getElementsByClassName("HP")[0];
        var mpDiv = this.sys["roleData"].getElementsByClassName("MP")[0];
        var expDiv = this.sys["roleData"].getElementsByClassName("EXP")[0];

        hpDiv.style.width = basicAttr.HP + "px";
        mpDiv.style.width = basicAttr.MP + "px";
        expDiv.style.width = basicAttr.EXP + "px";
        

    };



    System.prototype.showGoods = function() {
        if(this.currLayer){ this.currLayer.style.display = "none"; }
        this.sys["goods"].style.display = "block";
        this.currLayer = this.sys["goods"];

        if(!this.sys["goods"].dataset.updated){
            console.log("showGoods updated");
            var iconImg = this.sys["goods"].getElementsByClassName("icon")[0];
            var detailDiv = this.sys["goods"].getElementsByClassName("detail")[0];
            var goodsList = this.sys["goods"].getElementsByClassName("list")[0];

            console.log("detailsJson", this.detailsJson);
            goodsList.innerHTML = "<li class='head'> <span> name </span> <span> number </span> </li>";

            var goodsData = this.gameData.common.goods;
            for(var k  in goodsData){
                var data = goodsData[k];
                var detail = this.detailsJson.goods[k];
                var element = document.createElement('li');
                element.className = "goodsItem";
                element.addEventListener("click", this.showItem(detailDiv, iconImg, detail), false);
                element.innerHTML = "<span>" + detail.name + "</span>" + "<span>" + data.num + "</span>";
                goodsList.appendChild(element);
            }

            this.sys["goods"].dataset.updated = "updated";
        }

        
    };
    System.prototype.showItem = function(detailDiv, iconImg, detail) {
        return function(){
            detailDiv.innerHTML = detail.describe;
            iconImg.src = "resource/system/goods/" + detail.icon;
        }
    };

    System.prototype.showRecord = function(authority) {
        console.log("showRecordddddddddddd");
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
                var data = this.getData(i);
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
        this.saveData(data, id);
    };
    System.prototype.readRecord = function(id) {
        var data = this.getData(id);
        data && this.app.startGame(data);
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

    System.prototype.getStuff = function(data) {
        var gainDiv = document.getElementById("gainTips");
        gainDiv.innerHTML = "";
        
        this.sys["goods"].dataset.updated = "";
        for(var i = 0; i < data.length; i++){
            var stuff = data[i];
            // show info
            var element = document.createElement('div'); 
            element.innerHTML = " GET " + stuff[1] + " X " + stuff[2];
            gainDiv.appendChild(element);

            switch(stuff[0]){
                case "coin":
                    this.gameData.playerAttr.coin += stuff[2];
                    break;
                case "goods":
                    if(this.gameData.common.goods[stuff[1]]){
                        this.gameData.common.goods[stuff[1]].num += stuff[2];
                    }else{
                        this.gameData.common.goods[stuff[1]] = {
                            num: stuff[2]
                        };
                    }              
                    break;
            }
        }

        utils.flash(gainDiv);


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
                this.app.startGame(this.defaultData);
                break;
            case "menuRecord":
                this.sys["mainMenu"].style.display = "none";
                this.showRecord("R");
                this.state = "readRecord";
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
            case "toRecord":
                this.showRecord("R");
                break;
           
        }
    };


    System.prototype.update = function() {
        this.introMoving && this.moveIntro();
    };

    System.prototype.moveIntro = function() {

        var prev = this.sys["intro"].style.backgroundPositionX.slice(0, -1);
        this.sys["intro"].style.backgroundPositionX = (prev - this.MOVE_INTRO_SPEED) + "%";

    };

    System.prototype.onkeydown = function(keyCode){

        switch(keyCode){
            case 27:
                if(this.state === "intro"){
                    this.hideIntro();
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
               }else if(this.state === "readRecord"){
                   this.sys["record"].style.display = "none";
                   this.sys["mainMenu"].style.display = "block";
                   this.state = "";         
               }
        }

    };

    System.prototype.onkeyup = function(keyCode){


    };


    return System;

});