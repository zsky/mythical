requirejs.config({
    // 定义文件、路径的简写
    paths: {
        'lib': 'lib/'
    }

});

requirejs([
    'App'
], function(app){
    
    app.init();

});
