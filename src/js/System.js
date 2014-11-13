define(['lib/pixi', 'utils'], function (PIXI, utils) {

    var logged = {};

    var System = function(app){

        this.app = app;
        this.sys = {};
        this.menus = {};

        this.init();

        // consts
        this.MOVE_INTRO_SPEED = 0.04;
        this.RECORD_NUM = 10;
        this.RATINGBAR_WIDTH = 200;
        this.BAR_WIDTH = 97;

        this.defaultData = {
            
            playerDisp: {
                x: 200,
                y: 415,
                vX: 1.5,
                vY: 1.5,
                dire: "U",
                mapName: "start",
                textureData: {
                    path: "resource/role/qiangu.png",
                    actions: ["walkD", "walkL", "walkR", "walkU"],
                    imgWidth: 100,
                    imgHeight: 100,
                    frame_num: 4,
                    ratio: 0.6
                }
            },
            playerAttr: {
                basicAttr: {
                    coin: 33,
                    HP: 100,
                    HP_MAX: 120,
                    MP: 60,
                    MP_MAX: 120,
                    EXP: 20,
                    EXP_MAX: 30,
                    rank: 1,
                    avatar: "resource/avatar/qiangu.jpg",
                    figure: "resource/avatar/qiangu.jpg"
                },
                battleAttr: {
                    ATK: 23,
                    DEF: 22,
                    rate: 1.5,
                    luck: 1
                },
                skills: {
                    "gold0": { rank: 1 }
                },
                usedEquip: [
                    {type: "weapon", name: "WEAPON1"},
                    {type: "armor", name: ""},
                    {type: "bracelet", name: ""},
                    {type: "shoe", name: ""}
                ]
            },
            common: {
                goods: {
                    "HP1": { num: 2 },
                    "MP1": { num: 1 }
                },
                equip: {
                    "ARMOR1": { num: 1 },
                    "WEAPON1": { num: 1 }
                },
                task: "task1"
            }

        }


    };

    System.prototype.init = function() {

        var sysNames = ["loading", "intro", "mainMenu", "avatar", "sysMenu", 
            "roleData", "goods", "equip", "record", "battle", "gameOver"];
        for(var i = 0; i < sysNames.length; i++){
            var name = sysNames[i];
            this.sys[name] = document.getElementById(name);
        }

        var menuNames = ["menuRecord", "menuStart", "avatarImg", "toRoleData", 
            "toGoods", "toEquip", "toRecord", "phyAttack", "escape"];
        for(var i = 0; i < menuNames.length; i++){
            var name = menuNames[i];
            this.menus[name] = document.getElementById(name);
            this.menus[name].addEventListener("click", this.bindEvent(name), false);
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
        this.app.audio.playBgm("intro");
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

    System.prototype.showAvatar = function(pos) {
        this.sys["avatar"].style.display = "block";

        if(!pos) pos = {x: 0, y: 0};
        this.sys["avatar"].style.left = pos.x + 'px';
        this.sys["avatar"].style.top = pos.y + 'px';

        this.sys["record"].style.display = "none";
        var basicAttr = this.gameData.playerAttr.basicAttr;
        var rankSpan = this.sys["avatar"].getElementsByClassName("rank")[0];
        rankSpan.innerHTML = basicAttr.rank;
        var coinSpan = this.sys["avatar"].getElementsByClassName("coin")[0];
        coinSpan.innerHTML = basicAttr.coin; 

        this.updateAttrBar("HP", 0);
        this.updateAttrBar("MP", 0);
        this.updateAttrBar("EXP", 0);

        
    };

    // type: HP, MP, EXP
    System.prototype.updateAttrBar = function(type, changeValue) {
        var basicAttr = this.gameData.playerAttr.basicAttr;
        var div = this.sys["avatar"].querySelector("." + type);
        if(basicAttr[type] + changeValue > basicAttr[type + "_MAX"]){
            basicAttr[type] = basicAttr[type + "_MAX"];
        }else{
            basicAttr[type] += changeValue;
        }
        var percent = basicAttr[type] / basicAttr[type + "_MAX"];
        div.style.width = percent * this.BAR_WIDTH + "px";
    };

    System.prototype.hideAvatar = function() {
        this.sys["avatar"].style.display = "none";
    };

    System.prototype.showMainMenu = function() {
        this.state = "mainMenu";
        this.app.audio.playBgm("menu");

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
        this.app.audio.playBgm("menu");
        this.sys["sysMenu"].style.display = "block";
        var basicAttr = this.gameData.playerAttr.basicAttr;
      
        // default
        this.showRoleData();
        //this.showGoods();
        //this.showEquip();
    };

    System.prototype.showRoleData = function() {
        console.log("System showRoleData");

        if(this.currLayer) {  console.log("cao", this.currLayer);  this.currLayer.style.display = "none"; }
        this.currLayer = this.sys["roleData"];
        console.log("this.currLayer", this.currLayer);
        this.sys["roleData"].style.display = "block";

        if(this.currMenu) { 
            var img = this.currMenu.src.slice(0, -12) + this.currMenu.src.slice(-4);
            this.currMenu.src = img;
        }
        this.currMenu = this.menus["toRoleData"];
        var selectedImg = this.currMenu.src.slice(0, -4) + "Selected" + this.currMenu.src.slice(-4);
        this.currMenu.src = selectedImg;

        var pos = {
            x: 32,
            y: 54
        }
        this.showAvatar(pos);
        var battleAttr = this.gameData.playerAttr.battleAttr;
        var atkSpan = this.sys["roleData"].querySelector(".attrATK");
        var defSpan = this.sys["roleData"].querySelector(".attrDEF");
        var rateSpan = this.sys["roleData"].querySelector(".attrRate");
        var luckSpan = this.sys["roleData"].querySelector(".attrLuck");
        atkSpan.innerHTML = battleAttr.ATK;
        defSpan.innerHTML = battleAttr.DEF;
        rateSpan.innerHTML = battleAttr.rate;
        luckSpan.innerHTML = battleAttr.luck;


    };



    System.prototype.showGoods = function() {
        this.hideAvatar();
        if(this.currLayer){ this.currLayer.style.display = "none"; }
        this.sys["goods"].style.display = "block";
        this.currLayer = this.sys["goods"];

        if(this.currMenu) { 
            var img = this.currMenu.src.slice(0, -12) + this.currMenu.src.slice(-4);
            this.currMenu.src = img;
        }
        this.currMenu = this.menus["toGoods"];
        var selectedImg = this.currMenu.src.slice(0, -4) + "Selected" + this.currMenu.src.slice(-4);
        this.currMenu.src = selectedImg;

        if(!this.sys["goods"].dataset.updated){
            console.log("showGoods updated");
            var iconImg = this.sys["goods"].getElementsByClassName("icon")[0];
            var detailDiv = this.sys["goods"].getElementsByClassName("detail")[0];
            var goodsList = this.sys["goods"].getElementsByClassName("list")[0];

            console.log("detailsJson", this.detailsJson);
            goodsList.innerHTML = "<li class='head'> <span> 名字 </span> <span> 数量 </span> <span> 使用 </span> </li>";

            var goodsData = this.gameData.common.goods;
            for(var k  in goodsData){
                var data = goodsData[k];
                var detail = this.detailsJson.goods[k];
                var element = document.createElement('li');
                element.className = "goodsItem";

                var goodsName = document.createElement('span');
                goodsName.innerHTML = detail.name;
                goodsName.addEventListener("click", this.showItem(detailDiv, iconImg, detail, "goods").bind(this), false);
                var goodsNum = document.createElement('span');
                goodsNum.innerHTML = data.num;
                var useGoods = document.createElement('span');
                useGoods.innerHTML = "Use";
                useGoods.addEventListener("click", this.useItem(data, detail, goodsNum, element).bind(this), false);

                element.appendChild(goodsName);
                element.appendChild(goodsNum);
                element.appendChild(useGoods);

                goodsList.appendChild(element);
            }

            this.sys["goods"].dataset.updated = "updated";
        }

    };


    System.prototype.showEquip = function() {
        this.hideAvatar();
        if(this.currLayer){ this.currLayer.style.display = "none"; }
        this.sys["equip"].style.display = "block";
        this.currLayer = this.sys["equip"];

        if(this.currMenu) { 
            var img = this.currMenu.src.slice(0, -12) + this.currMenu.src.slice(-4);
            this.currMenu.src = img;
        }
        this.currMenu = this.menus["toEquip"];
        var selectedImg = this.currMenu.src.slice(0, -4) + "Selected" + this.currMenu.src.slice(-4);
        this.currMenu.src = selectedImg;

        if(!this.sys["equip"].dataset.updated){
            var iconImg = this.sys["equip"].getElementsByClassName("icon")[0];
            var detailDiv = this.sys["equip"].getElementsByClassName("detail")[0];
            var equipList = this.sys["equip"].getElementsByClassName("list")[0];

            console.log("show equip detailsJson", this.detailsJson);
            equipList.innerHTML = "<li class='head'> <span> 名字 </span> <span> 数量 </span> <span> 使用 </span> </li>";

            var equipData = this.gameData.common.equip;
            for(var k  in equipData){
                var data = equipData[k];
                var detail = this.detailsJson.equip[k];
                var element = document.createElement('li');
                element.className = "equipItem";

                var equipName = document.createElement('span');
                equipName.innerHTML = detail.name;
                equipName.addEventListener("click", this.showItem(detailDiv, iconImg, detail, "equip").bind(this), false);
                var equipNum = document.createElement('span');
                equipNum.innerHTML = data.num;
                var useEquip = document.createElement('span');
                useEquip.innerHTML = "Use";
                useEquip.addEventListener("click", this.useItem(data, detail, equipNum, element).bind(this), false);

                element.appendChild(equipName);
                element.appendChild(equipNum);
                element.appendChild(useEquip);

                equipList.appendChild(element);
            }

            var divs = {
                weapon: this.sys["equip"].querySelector(".equipWeapon"),
                armor: this.sys["equip"].querySelector(".equipArmor"),
                bracelet: this.sys["equip"].querySelector(".equipBracelet"),
                shoe: this.sys["equip"].querySelector(".equipShoe")
            }

            var usedEquip = this.gameData.playerAttr.usedEquip;
            for(var i = 0; i < usedEquip.length; i++){
                var e = usedEquip[i];
                var dispName;
                if(e.name){
                    dispName = this.detailsJson.equip[e.name].name;
                }else{
                    dispName = "None";
                }
                divs[e.type].innerHTML = dispName;
            }




            this.sys["equip"].dataset.updated = "updated";
        }

    };

    System.prototype.showItem = function(detailDiv, iconImg, detail, type) {
        return function(){
            detailDiv.innerHTML = detail.describe;
            if(type === "goods"){
                iconImg.src = "resource/goods/" + detail.icon;
            }else{
                iconImg.src = "resource/equip/" + detail.icon;
            }
            
        }
    };

    System.prototype.useItem = function(data, detail, goodsNum, element) {
        return function(){
            console.log("useItem", data, detail, goodsNum);
            if(data.num < 1) return;
            this.app.audio.playEffect("useIt");
            var goodsList = this.sys["goods"].getElementsByClassName("list")[0];
            switch(detail.effect.type){
                case "HP":
                    this.updateAttrBar("HP", detail.effect.value);

                    data.num -= 1;
                    goodsNum.innerHTML = data.num;
                    if(data.num === 0){
                        goodsList.removeChild(element);
                    }
                    break;
                case "MP":
                    this.updateAttrBar("MP", detail.effect.value);

                    data.num -= 1;
                    goodsNum.innerHTML = data.num;
                    if(data.num === 0){
                        goodsList.removeChild(element);
                    }
                    break;
                case "ATK":
                    console.log('add atk', data, detail);
                    var usedEquip = this.gameData.playerAttr.usedEquip;
                    if(detail.type === "weapon"){
                        if(usedEquip[0].name){
                            

                        }
                    }
                    break;

            }
        }
    };

    System.prototype.showRecord = function(authority) {
        console.log("showRecordddddddddddd");
        this.sys["sysMenu"].style.display = "none";
        this.sys["record"].style.display = "block";

        var readIcon = this.sys["record"].querySelector(".readIcon");
        var writeIcon = this.sys["record"].querySelector(".writeIcon");
        if(authority == "R"){
            readIcon.src = "resource/system/record/read.png";
            writeIcon.src = "resource/system/record/writeGray.png";
        }else if(authority == "W"){
            readIcon.src = "resource/system/record/readGray.png";
            writeIcon.src = "resource/system/record/write.png";
        }

        var recordList = this.sys["record"].getElementsByClassName("list")[0];

        this.sys["record"].dataset.authority = authority;

        if(!this.sys["record"].dataset.created){
            for(var i = 0; i < this.RECORD_NUM; i++){
                var element = document.createElement('div'); 
                element.addEventListener("click", this.recordEvent(i).bind(this), false);
                element.className = "recordItem";
                element.id = "record" + i;
                recordList.appendChild(element);
                var num = document.createElement('div'); 
                num.className = "recordNum";
                num.innerHTML = i;
                element.appendChild(num);

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
            console.log("recordEventtt", this.sys["record"].dataset);
            this.app.audio.playEffect("clickRecord");
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
                    this.gameData.playerAttr.basicAttr.coin += stuff[2];
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
                case "equip":
                    if(this.gameData.common.equip[stuff[1]]){
                        this.gameData.common.equip[stuff[1]].num += stuff[2];
                    }else{
                        this.gameData.common.equip[stuff[1]] = {
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
            that.app.audio.playEffect("clickMenu");
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
            case "toEquip":
                this.showEquip();
                break;
            case "toRecord":
                this.state = "sysRecord";
                this.showRecord("R");
                break;
            case "phyAttack":
                this.app.battle.playerPhyAttck();
                break;
            case "escape":
                this.app.battle.escape();
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

    //  in battle

    System.prototype.startBattle = function(player, enemies) {

        this.battleRoles = [].concat(player, enemies);
        this.showRatingBar();
    };


    System.prototype.showRatingBar= function() {

        this.sys["battle"].style.display = "block";

        var ratingBar = this.sys["battle"].getElementsByClassName("ratingBar")[0]; 
        ratingBar.style.width = this.RATINGBAR_WIDTH;

        this.state = "battle";

        // clear it
        ratingBar.innerHTML = "";

        for(var i = 0; i < this.battleRoles.length; i++){
            var role = this.battleRoles[i];
            var ratingDiv = document.createElement('div'); 
            ratingDiv.className = "ratingDiv";
            ratingDiv.innerHTML = "r" + i;
            ratingBar.appendChild(ratingDiv);
            role.setRatingData(ratingDiv);

        }

        this.app.battle.startRating();
    };
    System.prototype.hideRating = function() {
        this.sys["battle"].style.display = "none";
    };
    System.prototype.removeDiv = function(ratingDiv) {
        var ratingBar = this.sys["battle"].getElementsByClassName("ratingBar")[0]; 
        ratingBar.removeChild(ratingDiv);
    };
    System.prototype.changeMargin = function(ratingDiv, percent) {

        var marginLeft = percent/100 * this.RATINGBAR_WIDTH;
        ratingDiv.style.marginLeft = marginLeft + "px";
    };

    System.prototype.showOperation = function(){
        var operation = this.sys["battle"].getElementsByClassName("operation")[0];
        operation.style.display = "block";
    };
    System.prototype.hideOperation = function(){
        var operation = this.sys["battle"].getElementsByClassName("operation")[0];
        operation.style.display = "none";
    };

    System.prototype.updatePlayerHP = function(damage) {
        var basicAttr = this.gameData.playerAttr.basicAttr;
        basicAttr.HP -= damage;
        if(basicAttr.HP > 0){
            console.log("updatePlayerHP", basicAttr.HP);
            var hpDiv = this.sys["avatar"].getElementsByClassName("HP")[0];
            this.updateAttrBar("HP", -damage);
        }else{
            this.gameOver();
        }
    };
    System.prototype.gameOver = function() {
        console.log("gameOver");
        this.sys["gameOver"].style.display = "block";
        this.app.changeMode("over");
    };


    System.prototype.onkeydown = function(keyCode){
        switch(keyCode){
            case 27:
                console.log("this.state", this.state);
                if(this.state === "intro"){
                    this.hideIntro();
                }else if(this.state === "sysMenu"){
                    this.sys["sysMenu"].style.display = "none";
                    this.showAvatar();
                    this.app.changeMode("normal"); 
                    this.state = ""; 
                }else if(this.state === "sysRecord"){
                    this.sys["record"].style.display = "none";
                    this.sys["sysMenu"].style.display = "block";
                    this.state = "sysMenu";
               }else if(this.state === "readRecord"){
                   this.sys["record"].style.display = "none";
                   this.sys["mainMenu"].style.display = "block";
                   this.state = "";         
               }else if(this.state === "writeRecord"){   
                   this.sys["record"].style.display = "none";
                   this.showAvatar();
                   this.app.changeMode("normal"); 
               }
        }

    };

    System.prototype.onkeyup = function(keyCode){


    };


    return System;

});
