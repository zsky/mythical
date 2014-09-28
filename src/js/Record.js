define(['lib/pixi'], function (PIXI) {

    var Record = function(app){


        this.app = app;

        this.defaultData = {
            mapName: "start",
            player: {
                properties: {
                    x: 200,
                    y: 415,
                    vX: 3,
                    vY: 3,
                    dire: "U",
                    HP: 100,
                    HP_MAX: 120,
                    MP: 100,
                    MP_MAX: 120,
                    EXP: 20,
                    EXP_MAP: 30,
                    rank: 1,
                    avatar: "resource/avatar/qiangu.jpg"
                },
                textureData: {
                    path: "resource/role/qiangu.png",
                    actions: ["walkD", "walkL", "walkR", "walkU"],
                    imgWidth: 100,
                    imgHeight: 100,
                    frame_num: 4,
                    ratio: 0.5
                }

            },
            goods: {
                num: 5
            }
        }

        // scene 

    };

    Record.prototype.getData = function(name) {
        if(name === "default"){
            return this.defaultData;
        }
    };

    




    return Record;

});