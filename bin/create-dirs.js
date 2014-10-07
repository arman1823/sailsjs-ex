
var fs = require('fs');

var createIfNotExists = function(path) {
    if ( ! fs.existsSync(path) ) {
        fs.mkdirSync(path);
    }
};


// upload directories

var createDirs = function(obj) {
    for ( var i in obj ) {
        if ( obj[i].directory ) {
            createIfNotExists(obj[i].directory);
        } else {
            createDirs(obj[i]);
        }
    }
};

createIfNotExists( __dirname + '/../uploads' );
createDirs( require(__dirname + '/../config/upload.js').upload );
