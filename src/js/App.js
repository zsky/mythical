define(['Scene', 'System', 'Record', 'lib/pixi'], function (Scene, System, Record, PIXI) {

    var App = function(){

    };
    App.prototype.init = function(){

        console.log('start the game, 0.1');

        this.stage = new PIXI.Stage(0xff90ff);
        this.renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.view);
        this.renderer.view.style.display = "block";
        this.renderer.view.style.width = "100%";
        this.renderer.view.style.height = "100%";

        this.record = new Record(this);

     
        this.sceneContainer = new PIXI.DisplayObjectContainer();
        this.scene = new Scene(this.sceneContainer, this);

        //this.sysContainer = new PIXI.DisplayObjectContainer();
        //this.system = new System(this.sysContainer, this);
        this.system = new System(this);

        this.stage.addChild(this.sceneContainer);
        //this.stage.addChild(this.sysContainer);

        this.mode = "system";
        //this.system.showIntro();
        this.newGame();


        this.listenEvents();    

        requestAnimFrame(this.update.bind(this));

    };

    App.prototype.listenEvents = function(){

        var that = this;

        // resize canvas
        window.addEventListener('resize', this.resizeCanvas.bind(this), false);

        // listen events
        document.addEventListener("keydown", function(e){
            console.log('keydown', e.keyCode);
            e.preventDefault();
            if(that.mode === "normal"){
                that.scene.onkeydown(e.keyCode);
            } else if(that.mode === "system"){
                that.system.onkeydown(e.keyCode);
            }
            
        });

        document.addEventListener("keyup", function(e){
            if(that.mode === "normal"){
                that.scene.onkeyup(e.keyCode);
            } else if(that.mode === "system"){
                that.system.onkeydown(e.keyCode);
            }
            
        });

    };

    App.prototype.resizeCanvas = function(){
        this.renderer.view.width = window.innerWidth;
        this.renderer.view.height = window.innerHeight;
        if(this.mode === "normal"){
            this.scene.resizeScene();
        } else if(this.mode === "system"){
            this.system.resizeSys();
        }

    };

    App.prototype.update = function(){

        this.renderer.render(this.stage);

        if(this.mode === "normal"){
            this.scene.update();
        } else if(this.mode === "system"){
            this.system.update();
        }

        requestAnimFrame(this.update.bind(this));
       
    };

    App.prototype.showMenu = function(name) {
        this.system.showMenu(name);
    };

    App.prototype.newGame = function() {
        console.log('new game');
        //  TODO: 读取游戏进度
        var gameData = this.record.getData("default");
        var playerData = gameData.player;

        this.scene.goToMap(playerData);
        this.scene.initPlayer(playerData);

        this.mode = "normal";

        this.system.gameData = gameData;

        this.system.showAvatar();
    };

    return new App();


});