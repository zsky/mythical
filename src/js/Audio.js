define([], function () {

    var Audio = function(){

        this.bgm = {};
        this.effect = {};

        this.init();

    };
    Audio.prototype.init = function(){

        var bgmNames = ["intro", "menu", "main", "fight"];
        var bgmDiv = document.querySelector("#bgm");
        for(var i = 0, len = bgmNames.length; i < len; i++){
            var name = bgmNames[i];
            this.bgm[name] = bgmDiv.querySelector('.' + name);
        }

        var effectNames = ["attack", "clickMenu", "clickRecord", "useIt"];
        var effectDiv = document.querySelector("#effect");
        for(var i = 0, len = effectNames.length; i < len; i++){
            var name = effectNames[i];
            this.effect[name] = effectDiv.querySelector('.' + name);
        }

    };

    Audio.prototype.playBgm = function(name) {
        if(this.currBgm) { this.currBgm.pause(); };
        this.currBgm = this.bgm[name];
        this.currBgm.currentTime = 0;
        this.currBgm.play();

    };

    Audio.prototype.playEffect = function(name) {
        if(this.currEffect) { this.currEffect.pause(); };
        this.currEffect = this.effect[name];
        this.currEffect.currentTime = 0;
        this.currEffect.play();

    };

    return Audio;


});