var fs       = require("fs")
    UglifyJS = require("uglify-js"),
    path     = require("path"),
    mime     = require('mime');

exports.middleware = function (options) {
  return function (req, res, next) {
    var requestFile = req.url;
    var fileMime = mime.lookup(requestFile);

    if (fileMime === "application/javascript") {
      var sourcePath = path.join(options.src, req.url),
          srcExists  = fs.existsSync(sourcePath);

      if (srcExists) {
        // Find dest path, check modification date
        var sourceStat = fs.statSync(sourcePath),
            destPath   = path.join(options.dest, req.url),
            destExists = fs.existsSync(destPath),
            generate   = function () {
              var minified = UglifyJS.minify(sourcePath);
              fs.writeFileSync(destPath, minified.code);
            }

        if (destExists) {
          var destStat               = fs.statSync(destPath),
              sourceModificationTime = sourceStat.mtime.getTime(),
              destModificationTime   = destStat.mtime.getTime();

          if (sourceModificationTime > destModificationTime) {
            generate();
          }
        } else {
          generate();
        }        
      }
    }
    
    next();
  }
};
