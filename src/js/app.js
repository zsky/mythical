define(['Scene', 'System', 'lib/pixi'], function (Scene, System, PIXI) {

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




        this.mode = "normal";
     
        this.sceneContainer = new PIXI.DisplayObjectContainer();
        this.scene = new Scene('intro', this.sceneContainer, this);

        this.sysContainer = new PIXI.DisplayObjectContainer();
        this.system = new System(this.sysContainer, this);

        this.stage.addChild(this.sceneContainer);
        this.stage.addChild(this.sysContainer);


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
            }
            
        });

        document.addEventListener("keyup", function(e){
            if(that.mode === "normal"){
                that.scene.onkeyup(e.keyCode);
            }
            
        });

    };

    App.prototype.resizeCanvas = function(){
        this.renderer.view.width = window.innerWidth;
        this.renderer.view.height = window.innerHeight;
        this.scene.resizeScene();
        this.system.resizeSys();

    };

    App.prototype.update = function(){

        this.renderer.render(this.stage);

        this.scene.update();


        requestAnimFrame(this.update.bind(this));
       
    };

    App.prototype.showMenu = function(name) {
        this.system.showMenu(name);
    };

    App.prototype.newGame = function() {
        console.log('new game');
        //  TODO: 读取游戏进度
        // fake player data
        var playerData = {
            properties: {
                x: 200,
                y: 415,
                vX: 3,
                vY: 3,
                dire: "U",
                HP: 100,
                MP: 100,
                rank: 1
            },
            textureData: {
                actions: ["walkD", "walkL", "walkR", "walkU"],
                imgWidth: 100,
                imgHeight: 100,
                frame_num: 4,
                ratio: 0.5
            }
        }
        var args = {
            mapName: "start"
        }

        this.scene.goToMap(args);
        var data = {
            imgPath: "resource/avatar/qiangu.jpg",
            rank: 1,
            HP: 100,
            MP: 100
        }
        this.system.showAvatar(data);
    };

    return new App();


});