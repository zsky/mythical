define([], function () {

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


    return utils;


});










