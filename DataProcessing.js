// JavaScript source code
var maxTextures = 4;
var examplesCount = 3;

function preprocessData(pathDir, count, index) {

    var maxSide = sizeOfTexture;
    var side = sizeOfImage;

    var i = 0;
    var texNum = 0;

    var ctx = [];
    var texture = [];

    var maxImages = Math.pow(maxSide / side, 2) * maxTextures;

    for (var i = 0; i < maxTextures; i++) {
        var canvas = document.createElement('canvas');
        canvas.width = maxSide;
        canvas.height = maxSide;
        //var canvas = document.getElementById('myCanvas');
        ctx.push(canvas.getContext("2d"));
        texture.push(new THREE.Texture(canvas));
    }


    var names = getFileNames(pathDir, count);

    mergeData(names, 0, maxSide - side, texNum, index);

    function isAllLoaded() {
        for (var i = 0; i < 3; i++) {
            if (isLoaded[index] == false)
                return false;
        }

        return true;
    }


    function mergeData(names, x, y, texNum, index) {


        var name = names.shift();

        if (!name || i > maxImages)
        {
            if (!name)
                texture[texNum].needsUpdate = true;
            else if(i > maxImages)
                texture[maxTextures - 1].needsUpdate = true;

            isLoaded[index] = true;
            animate();
            if (isAllLoaded()) {
                document.getElementById("QualitySelect").disabled = false;
            }
        }
        else {
            var img = new Image;
            if (isLoaded[index]) {
                img = dataImages[index][i];
                i += 1;
                drawToCanvas(img, x, y, side, maxSide, ctx, texNum, index);
            }
            else {
                img = new Image;
                img.src = name;
                dataImages[index][i] = img;
                i += 1;
                img.onload = function () {
                    drawToCanvas(img, x, y, side, maxSide, ctx, texNum, index);
                };
            }
        }
    }

    function drawToCanvas(img, x, y, side, maxSide, ctx, texNum, index) {
        if (x < maxSide) {
            ctx[texNum].drawImage(img, x, y, side, side);
            x += side;
        }
        else {
            y -= side;
            if (y < 0) {
                texture[texNum].needsUpdate = true;
                y = maxSide-side;
                texNum += 1;
            }
            x = 0;
            ctx[texNum].drawImage(img, x, y, side, side);
            x += side;
        }
        mergeData(names, x, y, texNum, index);
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