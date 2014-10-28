define(['Scene', 'System', 'Battle', 'lib/pixi'], function (Scene, System, Battle, PIXI) {

    var App = function(){

    };
    App.prototype.init = function(){

        console.log('start the game, 0.1');

        //this.stage = new PIXI.Stage(0xff90ff);
        this.stage = new PIXI.Stage();
        this.renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.view);
        this.renderer.view.style.display = "block";
        this.renderer.view.style.width = "100%";
        this.renderer.view.style.height = "100%";

     
        this.sceneContainer = new PIXI.DisplayObjectContainer();
        this.scene = new Scene(this.sceneContainer, this);

        this.battleContainer = new PIXI.DisplayObjectContainer();
        this.battle = new Battle(this.battleContainer, this);

        this.system = new System(this);

        this.stage.addChild(this.sceneContainer);
        this.stage.addChild(this.battleContainer);

        this.listenEvents();    

        // load data
        this.loadSysData();

        requestAnimFrame(this.update.bind(this));

    };

    App.prototype.loadSysData = function() {

        this.system.showLoading();

        var sysLoader = new PIXI.JsonLoader("resource/system/details.json", false);
        sysLoader.on("loaded", this.onSysDataLoaded.bind(this));
        sysLoader.load(); 
    };
    App.prototype.onSysDataLoaded = function(data) {
        console.log("sys data loaded", data.content.json);
        this.system.setDetailsJson(data.content.json); 
        this.loadEnemyData();

    };
    App.prototype.loadEnemyData = function() {

        var enemyLoader = new PIXI.JsonLoader("resource/enemy/enemyAttr.json", false);
        enemyLoader.on("loaded", this.onEnemyDataLoaded.bind(this));
        enemyLoader.load(); 
    };
    App.prototype.onEnemyDataLoaded = function(data) {
        console.log("enemy attr data loaded", data.content.json);
        this.scene.setEnemiesJson(data.content.json); 
        this.battle.setEnemiesJson(data.content.json);

        this.system.hideLoading(function(){
             //this.showIntro();  // exec in system.js, not change mode
             this.app.startGame(this.defaultData);  
        });

    };

    App.prototype.listenEvents = function(){

        var that = this;

        // resize canvas
        window.addEventListener('resize', this.resizeCanvas.bind(this), false);

        // listen events
        document.addEventListener("keydown", function(e){
            console.log('keydown in app', e.keyCode, 'and mode', that.mode);
            e.preventDefault();
            if(that.mode === "normal"){
                that.scene.onkeydown(e.keyCode);
            } else if(that.mode === "system"){
                that.system.onkeydown(e.keyCode);
            } else if(that.mode === "battle"){
                that.battle.onkeydown(e.keyCode);
            }
            
        });

        document.addEventListener("keyup", function(e){
            if(that.mode === "normal"){
                that.scene.onkeyup(e.keyCode);
            } else if(that.mode === "system"){
                that.system.onkeydown(e.keyCode);
            } else if(that.mode === "battle"){
                that.battle.onkeydown(e.keyCode);
            }
            
        });

    };

    App.prototype.resizeCanvas = function(){
      
        if(this.mode === "normal"){
            this.renderer.view.width = window.innerWidth;
            this.renderer.view.height = window.innerHeight;
            this.scene.resizeScene();
        };

    };

    App.prototype.update = function(){

        this.renderer.render(this.stage);

        if(this.mode === "normal"){
            this.scene.update();
        } else if(this.mode === "system"){
            this.system.update();
        } else if(this.mode === "battle"){
            this.battle.update();
        }

        requestAnimFrame(this.update.bind(this));
       
    };

    App.prototype.startGame = function(data) {
        console.log('start game', data);

        var dispData = data.playerDisp;

        this.scene.goToMap(dispData.mapName);
        this.scene.player.initPlayer(dispData);

        this.changeMode("normal");

        this.system.gameData = data;

        //this.system.showAvatar();

        // Just for test
        this.changeMode("system");
        this.system.showSysMenu();

    };

    App.prototype.toBattle = function(battleData, enemyIndex) {
        this.changeMode("battle");
        //this.system.hideAvatar();
        this.battle.enter(battleData, enemyIndex);
    };



    // apis

    App.prototype.changeMode = function(mode) {
        console.log("app mode change to", mode);
        this.mode = mode;
    };
    App.prototype.hideAvatar = function() {
        this.system.hideAvatar();
    };
    App.prototype.getPlayerData = function() {
        return this.scene.getPlayerData();
    };
    App.prototype.getStuff = function(data) {
        this.system.getStuff(data);
    };
    App.prototype.getBattleAttr = function() {
        return this.system.gameData.playerAttr.battleAttr;
    };
    App.prototype.updatePlayerHP = function(damage) {
        this.system.updatePlayerHP(damage);
    };
    

    return new App();


});