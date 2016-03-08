
// JavaScript source code
function preprocessData(pathDir, texture1, count, index) {
    var maxSide = sizeOfTexture;
    var side = sizeOfImage;

    var canvas = document.createElement('canvas');
    //var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext("2d");
    var texture = new THREE.Texture(canvas);
    var i = 0;

    canvas.width = maxSide;
    canvas.height = maxSide;

    var names = getFileNames(pathDir, count);

    mergeData(names, 0, maxSide);


    function mergeData(names, x, y) {
        var name = names.shift();
        if (!name){
            texture.needsUpdate = true;
            isLoaded[index] = true;
        }
        else {
            var img = new Image;
            if (isLoaded[index]) {
                img = dataImages[index][i];
                i += 1;
                drawToCanvas(img, x, y, side, maxSide, ctx);
            }
            else {
                img = new Image;
                img.src = name;
                dataImages[index][i] = img;
                i += 1;
                img.onload = function () {
                    drawToCanvas(img, x, y, side, maxSide, ctx);
                };
            }
        }
    }

    function drawToCanvas(img, x, y, side, maxSide, ctx) {
        if (x < maxSide) {
            ctx.drawImage(img, x, y, side, side);
            x += side;
        }
        else {
            y -= side;
            x = 0;
            ctx.drawImage(img, x, y, side, side);
            x += side;
        }
        mergeData(names, x, y);
    }

    return texture;
}



function getFileNames(pathDir, count) {
    var fileNames = [];

    for (var i = 0; i < count; i++) {
        fileNames.push(pathDir + "IM-0001-" + pad(i + 1, 4) + ".png");
    }

    return fileNames;
}

var _getAllFilesFromFolder = function (dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function (file) {

        file = dir + '/' + file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}