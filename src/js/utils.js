define(['lib/pixi'], function (PIXI) {

    var utils = {};
    utils.flash = function(dom){
    	dom.style.opacity = 0;
    	dom.style.display = "block";
    	this.show(dom, this.hide);
    };

    utils.show = function(dom, callback){
    	var that = this;
    	if(parseFloat(dom.style.opacity) > 1){
    		if(callback){
    			setTimeout(function(){ callback.call(that, dom) }, 600);
    		}  	
    		return;
    	} 	
    	dom.style.opacity = parseFloat(dom.style.opacity) + 0.1;
    	setTimeout(function(){ that.show(dom, callback) }, 100);
    };
    utils.hide = function(dom, callback){
    	var that = this;
    	if(parseFloat(dom.style.opacity) < 0){
    		if(callback){
    			setTimeout(function(){ callback.call(that, dom) }, 100);
    		} 
    		dom.style.display = "none"; 		
    		return;
    	}
    	dom.style.opacity = parseFloat(dom.style.opacity) - 0.1;
    	setTimeout(function(){ that.hide(dom, callback) }, 100);
    };

    
    utils.extend = function(Child, Parent){

        var F = function(){};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        //Child.uber = Parent.prototype;　　　　
    };


    utils.collDetect = function(dire, barriers, pX, pY){
        var space = 5; // collision space

        for(var i = 0; i < barriers.length; i++){
            
            if(barriers[i].ellipse){
                var r = barriers[i].width/2;
                var cX = barriers[i].x + r;
                var cY = barriers[i].y + r;
                var dist2 = (cX - pX)*(cX - pX) + (cY - pY)*(cY - pY);
                if(dire=="L" && pX>cX && dist2 < r*r) return true;
                if(dire=="U" && pY>cY && dist2 < r*r) return true;
                if(dire=="R" && pX<cX && dist2 < r*r) return true;
                if(dire=="D" && pY<cY && dist2 < r*r) return true;
            }else{
                var b = {};
                b.x = barriers[i].x;
                b.y = barriers[i].y;
                b.w = barriers[i].width;
                b.h = barriers[i].height;
                if(dire=="L" && pY>b.y && pY<b.y+b.h && pX>b.x && pX<b.x+b.w+space)
                    return true;
                if(dire=="U" && pY>b.y && pY<b.y+b.h+space && pX>b.x && pX<b.x+b.w)
                    return true;
                if(dire=="R" && pY>b.y && pY<b.y+b.h && pX>b.x-space && pX<b.x+b.w)
                    return true;
                if(dire=="D" && pY>b.y-space && pY<b.y+b.h && pX>b.x && pX<b.x+b.w)
                    return true;
                
            }
        }
        return false;

    }





    return utils;


});










