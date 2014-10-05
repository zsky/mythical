define(['lib/pixi'], function (PIXI) {

    var Record = function(app){


        this.app = app;

        this.defaultData = {
            
            player: {
                x: 200,
                y: 415,
                vX: 3,
                vY: 3,
                dire: "U",
                mapName: "start",
                textureData: {
                    path: "resource/role/qiangu.png",
                    actions: ["walkD", "walkL", "walkR", "walkU"],
                    imgWidth: 100,
                    imgHeight: 100,
                    frame_num: 4,
                    ratio: 0.5
                }
            },
            playersAttr: [{
                rolename: "qiangu",
                coin: 33,
                HP: 100,
                HP_MAX: 120,
                MP: 100,
                MP_MAX: 120,
                EXP: 20,
                EXP_MAP: 30,
                rank: 1,
                avatar: "resource/avatar/qiangu.jpg",
                figure: "resource/avatar/qiangu.jpg"
            }],
            battleAttr: [{
                rolename: "qiangu",
                ATK: 23,
                DEF: 12,
                agility: 1,
                luck: 1
            }],
            skills: [{
                rolename: "qiangu",
                physics:[{
                    name: "phy1",
                    rank: 1
                }],
                magic:[{
                    name: "magic1",
                    rank: 1
                }]
            }],
            goods: [{
                name: "HP1",
                num: 3
            },
            {
                name: "MP1",
                num: 3
            }],
            equipment: [{
                name: "armor1",
                num: 1
            }],
            task: "task1"
        }

    };

    Record.prototype.getData = function(name) {
        if(name === "default"){
            return this.defaultData;
        }
    };

    


    return Record;

});