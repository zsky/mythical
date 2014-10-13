define(['lib/pixi', 'Anime'], function (PIXI, Anime) {

    var Battle = function(container, scene){

        this.container = container;
        this.scene = scene;

        this.init();

    };

    Battle.prototype.init = function() {

        this.posInfo = [
            [],
            [ [90, 300] ],
            [ [90, 260], [90, 340] ],
            [ [90, 240], [90, 300], [90, 360] ]
        ];

        this.bgInfo = [
            {
                src: "resource/bg/battle0.png",
                width: 840,
                height: 640
            }
        ];

        this.playerPos = [490, 340];

    };

    Battle.prototype.clear = function() {
        this.enemies = [];
        this.enemyNum = 0;
    };

    Battle.prototype.enter = function(data) {
        console.log("enter battle", data);
        this.container.visible = true;
        this.clear();
        this.enemyData = data.enemies;
        this.gains = data.gain;
        this.enemyNum = data.enemyNum;
        this.enemyPos = this.posInfo[this.enemyNum].slice();

        if(!this.bg) this.showBg(this.bgInfo[0]);

        if(this.enemyAttrJson){
            this.createEnemy();
        }else{
            this.loadEnemyData();
        }
    };

    Battle.prototype.showBg = function(data) {

        this.bg = PIXI.Sprite.fromImage(data.src);
        var ratio = Math.max(window.innerWidth/data.width, window.innerHeight/data.height);
        this.bg.scale.x = ratio;
        this.bg.scale.y = ratio;
        this.container.addChild(this.bg);

    };

    Battle.prototype.loadEnemyData = function() {

        var enemyLoader = new PIXI.JsonLoader("resource/enemy/enemyAttr.json", false);
        enemyLoader.on("loaded", this.onEnemyDataLoaded.bind(this));
        enemyLoader.load(); 
    };
    Battle.prototype.onEnemyDataLoaded = function(data) {
        console.log("enemy attr data loaded", data);
        this.enemyAttrJson = data.content.json; 

        this.createEnemy();


    };

    Battle.prototype.createEnemy = function() {

        console.log("this.enemyData", this.enemyData);

        for(var i = 0; i < this.enemyData.length; i++){
            console.log("createEnemy", i);
            var e = this.enemyData[i];
            var enemyAttr = this.enemyAttrJson[e[0]];
            for(var j = 0; j < e[1]; j++){

                var pos = this.enemyPos.pop();

                var enemy = new Anime(this.container, this);
                enemy.loadAction(enemyAttr.textureData);
                var animeAttr = enemyAttr.animeAttr;
                animeAttr.x = pos[0];
                animeAttr.y = pos[1];
                animeAttr.category = "battleEnemy";
                enemy.draw("R", animeAttr);
                this.enemies.push(enemy);

            }

        }

        this.createPlayer();
    };

    Battle.prototype.createPlayer = function() {
 
        
        var data = this.scene.getPlayerData();
        this.player = new Anime(this.container, this);
        data.textureData.ratio = 0.6;
        this.player.loadAction(data.textureData);

        console.log('createPlayer', this.scene.getPlayerData());
        var animeAttr = {
            x: this.playerPos[0],
            y: this.playerPos[1],
            vX: data.vX,
            vY: data.vY
        }
        animeAttr.category = "battlePlayer";
        this.player.draw("L", animeAttr);
    };




    Battle.prototype.update = function() {

        for(var i = 0; i < this.enemies.length; i++){
            var enemy = this.enemies[i];
            enemy.update();
        }
        
    };


    Battle.prototype.onkeydown = function(keyCode){
        if(keyCode === 32){
            this.enemies[0].attack();
        }else if(keyCode === 75){
            console.log('player pos', this.player.x, this.player.y);
            for(var i = 0; i < this.enemies.length; i++){
                var enemy = this.enemies[i];
                console.log("enemy pos", enemy.x, enemy.y);
            }
        }


    };

    Battle.prototype.onkeyup = function(keyCode){


    };

    return Battle;

});