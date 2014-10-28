define(['lib/pixi', 'Anime', 'Enemy'], function (PIXI, Anime, Enemy) {

    var Battle = function(container, app){

        this.container = container;
        this.app = app;

        // consts
        this.ATTACK_POINT = 80;
        this.DIST = 400;
        this.MOVE_SPEED = 4.5;

        this.init();

    };

    Battle.prototype.init = function() {

        var mid = [90, 360];
        var spaceH = 60;
        this.posInfo = [
            [],
            [ [mid[0], mid[1]] ],
            [ [mid[0], mid[1] - spaceH/2], [mid[0], mid[1] + spaceH/2] ],
            [ [mid[0], mid[1] - spaceH], [mid[0], mid[1]], [mid[0], mid[1] + spaceH] ]
        ];

        this.bgInfo = [
            {
                src: "resource/bg/battle0.png",
                width: 840,
                height: 640
            }
        ];

        this.playerPos = [mid[0] + this.DIST, mid[1]];

    };
    Battle.prototype.setEnemiesJson = function(data) {
        this.enemiesJson = data;
    };

    Battle.prototype.clear = function() {
        this.enemies = [];
        this.enemyNum = 0;
        this.isAttacking = false;
        this.bg = null;

        var con = this.container;
        for (var i = con.children.length - 1; i >= 0; i--) {
            con.removeChild(con.children[i]);
        };

    };

    Battle.prototype.enter = function(data, enemyIndex) {
        console.log("enter battle", data);
        this.enemyIndex = enemyIndex;
        this.container.visible = true;
        this.clear();
        this.enemyData = data.enemies;
        this.gains = data.gain;
        this.enemyNum = data.enemyNum;
        this.enemyPos = this.posInfo[this.enemyNum].slice();

        if(!this.bg) this.showBg(this.bgInfo[0]);

        this.createEnemy();

    };

    Battle.prototype.showBg = function(data) {

        this.bg = PIXI.Sprite.fromImage(data.src);
        var ratio = Math.max(window.innerWidth/data.width, window.innerHeight/data.height);
        this.bg.scale.x = ratio;
        this.bg.scale.y = ratio;
        this.container.addChild(this.bg);

    };

    Battle.prototype.createEnemy = function() {

        for(var i = 0; i < this.enemyData.length; i++){
            var e = this.enemyData[i];
            var enemyAttr = this.enemiesJson.enemiesAttr[e[0]];
            var textureData = this.enemiesJson.textureDatas[enemyAttr.textureIndex];

            for(var j = 0; j < e[1]; j++){

                var pos = this.enemyPos.pop();
                var data = {
                    textureData: textureData,
                    start: {
                        x: pos[0],
                        y: pos[1]
                    },
                    vX: this.MOVE_SPEED
                }
                console.log("createEnemy", i, j, this.container, data);

                var enemy = new Enemy(this.container, data, this);
                enemy.actionChanged("stand", "R");
                enemy.setBattleAttr(enemyAttr.battleAttr);
                this.enemies.push(enemy);

            }

        }

        this.createPlayer();
    };

    Battle.prototype.createPlayer = function() {
 
        
        var playerData = this.app.scene.getPlayerData();
        var data = {
            textureData: playerData.textureData,
            start: {
                x: this.playerPos[0],
                y: this.playerPos[1]
            },
            vX: this.MOVE_SPEED
        }
        this.player = new Enemy(this.container, data, this);
        this.player.actionChanged("stand", "L");
        this.player.isPlayer = true;
        var battleAttr = this.app.getBattleAttr();
        this.player.setBattleAttr(battleAttr);

        this.app.system.startBattle(this.player, this.enemies);

    };

    Battle.prototype.startRating = function() {
        console.log("startRating", this.player, this.enemies);
        console.info("battle container children", this.container);
        this.battleRoles = [].concat(this.player, this.enemies);

    };

    Battle.prototype.playerPhyAttck = function() {
        if(this.player.isAttacking){
            this.player.startPhyAttack(this.battleRoles[1]);
        }
        
    };

    Battle.prototype.showDamage = function(damage, target) {
        var that = this;
        var text = new PIXI.Text("-" + damage, { font: "85px Snippet", fill: "red", align: "left" });
        text.position.x = target.x;
        text.position.y = target.y - 30;
        this.container.addChild(text);
        setTimeout(function(){ 
            that.container.removeChild(text);
        }, 800);
    };




    Battle.prototype.update = function() {

        for(var i = 0; i < this.enemies.length; i++){
            var enemy = this.enemies[i];
            enemy.update();
        }
        this.player.update();

        if(this.battleRoles && !this.isAttacking){
            for(var i = 0; i < this.battleRoles.length; i++){
                var role = this.battleRoles[i];
                if(!role.isAttacking){
                    var percent = role.progress();
                    if(!role.hasAttacked && percent > this.ATTACK_POINT){
                        this.isAttacking = true;
                        role.isAttacking = true;
                        if(role.isPlayer){
                            this.app.system.showOperation();
                        }else{
                            role.attack(this.player);
                        }
                        return;
                    }

                    this.app.system.changeMargin(role.ratingDiv, percent);


                }
            }
        }
        
    };

    Battle.prototype.updateEnemyHP = function(damage, target) {
        target.battleAttr.HP -= damage;
        if(target.battleAttr.HP < 0){
            target.currAction && target.container.removeChild(target.currAction);
            this.removeEnemy(target);
        }
    };

    Battle.prototype.removeEnemy = function(enemy) {
        console.log("in battle.js removeEnemy");

        for(var i = this.battleRoles.length - 1; i > 0; i--){
            var e = this.battleRoles[i];
            if(e === enemy) {
                this.battleRoles.splice(i, 1);
                this.app.system.removeDiv(enemy.ratingDiv);
                if(this.battleRoles.length <= 1) this.exitBattle();
                return;
            }
        }

    };

    Battle.prototype.exitBattle = function() {
        console.log("battle over", this.gains);
        this.battleRoles = [];
        this.app.scene.player.stepBack(45);
        this.app.scene.removeEnemy(this.enemyIndex);
        this.app.system.hideRating();
        this.finishAttack();
        var index = Math.floor(Math.random()*this.gains.length);
        this.app.getStuff(this.gains[index]);
        this.container.visible = false;
        this.app.changeMode("normal");

    };
    Battle.prototype.escape = function() {
        console.log("this.player", this.player, this.player.battleAttr);

        var escapeChance = 30 + this.player.battleAttr.luck;
        var randomNum = Math.floor(Math.random()*100);
        console.log("in battle escape", "escapeChance", escapeChance, "randomNum", randomNum);
        if(randomNum < escapeChance){
            this.battleRoles = [];
            this.app.scene.player.stepBack(45);
            this.app.system.hideRating();
            this.container.visible = false;
            this.app.changeMode("normal");
            this.finishAttack();
        }else{
            this.player.isAttacking = false;
            this.player.hasAttacked = true;
            this.finishAttack();
        }
    };

    Battle.prototype.finishAttack = function() {

        this.isAttacking = false;
        this.app.system.hideOperation();
    };


    Battle.prototype.onkeydown = function(keyCode){

        if(keyCode === 79){  // o
            console.log("check player", this.player.x, this.player.y);
            console.log("check layer container children", this.container.children);
        }

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