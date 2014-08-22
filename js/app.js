define(['Scene', 'lib/pixi'], function (Scene, PIXI) {

    var App = function(){

    };
    App.prototype.init = function(){

        console.log('start the game');

        this.stage = new PIXI.Stage(0x66FF99);
        this.renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.view);
        this.renderer.view.style.display = "block";
        this.renderer.view.style.width = "100%";
        this.renderer.view.style.height = "100%";



        this.scene = new Scene('start', this.stage);
        console.log(this.scene);
        this.scene.enter();
        

        requestAnimFrame(this.update.bind(this));

    };
    App.prototype.update = function(){

        this.renderer.render(this.stage);

        this.scene.update();


        requestAnimFrame(this.update.bind(this));
       
    };
    return new App();


});