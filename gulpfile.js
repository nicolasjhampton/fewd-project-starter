'use strict';

var gulp = require('gulp'),
    validator = require('gulp-html'),
    validate = require('gulp-w3c-css'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    unzip = require('gulp-unzip'),
    del = require('del'),
    open = require('gulp-open'),
    sourceFolders = ['../project/**/'];
    
    
    function overrideSrc() {
    
        var gulp_src = gulp.src;
        
        gulp.src = function() {
        
            return gulp_src.apply(gulp, arguments)
                        .pipe(plumber(function(error) {
                            // Output an error message
                            gutil.log(gutil.colors.red('\nHTML Error (' + error.plugin + '): \n' + error.message));
                            // emit the end event, to properly end the task
                            this.emit('end');
                        }));
        };
        
        return gulp.src;
        
    }
    

    function bufferCallback(err, files) {

        files.map(function(message){
            
            var filename = message.history.toString().replace(message.base.toString(), "");
            
            gutil.log(gutil.colors.green('\n' + filename + ' :'));
            
            if(message.contents.toString("utf-8") !== "") {
                
                var jason = JSON.parse(message.contents);
                
                jason.errors.map(function(inner){
                    
                    gutil.log(gutil.colors.red('\n' + filename + ' :' + '\nCSS On line: ' + inner.line + '\n' + 'Error: ' + inner.message));
                    
                });
                
                // jason.warnings.map(function(inner){
                    
                //     gutil.log(gutil.colors.blue('\nOn line: ' + inner.line + '\n' + 'Warning: ' + inner.message));
                    
                // });
                
            } else {
                
                gutil.log(gutil.colors.green('\nNo css errors')); 
                
            }      
        });
    };
    
    
gulp.task('cleanProjectFolder', function() {
    
    return del(['../project/*'], {force:true});
    
});


gulp.task('open',['cleanProjectFolder'], function(){
    
    return gulp.src('../*.zip')
             .pipe(unzip())
             .pipe(gulp.dest('../project'));
   
});


gulp.task('deleteZip', ['open'], function() {
    
    return del(['../*.zip'], {force:true});
    
});


gulp.task('html',['deleteZip'], function() {
    
    gulp.src = overrideSrc();
    
    sourceFolders.map(function(folder) {
        
        var target = folder + '*.html';
        
        gulp.src(target)
            .pipe(validator());
        
    });
    
});


gulp.task('css',['html'], function() {
    
    sourceFolders.map(function(folder) {
        
        var target = folder + '*.css';
        
        gulp.src(target)
            .pipe(validate())
            .pipe(gutil.buffer(bufferCallback));
        
    });
           
});

gulp.task('app',['css'], function(){
    
    var OSX = 'Google Chrome';
    var linux = 'google-chrome';
    var windows = 'chrome';
    
    var options = {
        app: OSX
    };
    
    gulp.src(sourceFolders + 'index.html')
        .pipe(open(options));
        
});


gulp.task('default', ['app']);