define(['Scene', 'lib/pixi'], function (Scene, PIXI) {

    var App = function(){

    };
    App.prototype.init = function(){

        console.log('start the game');

        this.stage = new PIXI.Stage(0xff90ff);
        this.renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.view);
        this.renderer.view.style.display = "block";
        this.renderer.view.style.width = "100%";
        this.renderer.view.style.height = "100%";


        //  TODO: 读取游戏进度


     
        this.sceneContainer = new PIXI.DisplayObjectContainer();
        this.scene = new Scene('start', this.sceneContainer, this);

        this.stage.addChild(this.sceneContainer);


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
            that.scene.onkeydown(e.keyCode);
        });

        document.addEventListener("keyup", function(e){
            console.log("keyup", e.keyCode);
            that.scene.onkeyup(e.keyCode);
        });

    };

    App.prototype.resizeCanvas = function(){
        this.renderer.view.width = window.innerWidth;
        this.renderer.view.height = window.innerHeight;
        this.scene.resizeScene();

    };

    App.prototype.update = function(){

        this.renderer.render(this.stage);

        this.scene.update();


        requestAnimFrame(this.update.bind(this));
       
    };

    App.prototype.goToScene = function(name) {
        this.prevContainer = this.sceneContainer;
        this.prevScene = this.scene;
        this.stage.removeChild(this.sceneContainer);

        this.sceneContainer = new PIXI.DisplayObjectContainer();
        this.scene = new Scene(name, this.sceneContainer, this);

        this.stage.addChild(this.sceneContainer);


    };
    return new App();


});