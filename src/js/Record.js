define(['lib/pixi'], function (PIXI) {

    var Record = function(app){


        this.app = app;

        this.defaultData = {
            
            player: {
                x: 200,
                y: 415,
                vX: 1.5,
                vY: 1.5,
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
                    id: "phy1",
                    rank: 1
                }],
                magic:[{
                    id: "magic1",
                    rank: 1
                }]
            }],
            goods: {
                "HP1": { num: 3 },
                "MP1": { num: 3 }
            },
            equipment: [{
                id: "armor1",
                num: 1
            }],
            task: "task1"
        }

    };

    Record.prototype.getData = function(id) {
        if(id === "default"){
            return this.defaultData;
        }
        var data = localStorage.getItem("record" + id);
        if(data) return JSON.parse(data);
        else return "";
    };

    Record.prototype.saveData = function(data, id) {
        localStorage.setItem("record" + id, JSON.stringify(data));
    };

    


    return Record;

});