define(['lib/pixi'], function (PIXI) {

    var System = function(app){

        this.app = app;
        this.sys = [];

        this.resizeable = false;

        this.init();


    };

    System.prototype.init = function() {
        var sysNames = ["intro", "mainMenu", "avatar", "sysMenu", "roleData", "goods"];
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

        this.sys["sysMenu"].style.display = "block";
        // default
        this.showRoleData();

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
            case "avatarImg":
                this.sys["avatar"].style.display = "none";
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
                }                
                break;
        }

    };

    System.prototype.onkeyup = function(keyCode){


    };

    return System;

});