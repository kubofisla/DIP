
( function () {
    CutPlane = function (camera, orbitControl) {
        var Camera = camera;
        var OrbitControl = orbitControl;
        var Lines = [];

        var Intersections = [];
    
        //Nastavenie hran bounding boxu
        CutPlane.prototype.setLines = function (lines) {
            Lines = lines;
        }

        //Pridanie hrany bounding boxu
        CutPlane.prototype.addLine = function (line) {
            Lines.push(line);
        }

        //Vytvorit rez kockou
        CutPlane.prototype.cutBox = function () {

            var plane = getPlane();

            //clear
            Intersections = [];

            //Hladanie bodov prierezu plochy cez bounding box
            for (var i = 0; i < 12; i++) {

                var inters = plane.intersectLine(Lines[i]);
                if(inters != undefined)
                    Intersections.push(inters);

                if (Intersections.length == 6)
                    break;
            }
            //ak sa nenasli prieniky tak nevytvara polygon
            if (Intersections.length < 3)
                return undefined;

            //zoradi body pre polygon
            sortIntersections();

            //vytvorenie polygonu
            var geometry = new THREE.Geometry();
            for (var i = 0; i < Intersections.length; i++) {
            //for (var i = 0; i < 3; i++) {
                geometry.vertices.push(Intersections[i]);
            }

            for (var i = 0; i < Intersections.length - 2; i++) {
            //var i = 0;
                geometry.faces.push(new THREE.Face3(0, 1 + i, 2 + i));
                geometry.faces[i].vertexColors[0] = new THREE.Color(Intersections[0].x,     Intersections[0].y,     1.0-Intersections[0].z);
                geometry.faces[i].vertexColors[1] = new THREE.Color(Intersections[1 + i].x, Intersections[1 + i].y, 1.0 - Intersections[1 + i].z);
                geometry.faces[i].vertexColors[2] = new THREE.Color(Intersections[2 + i].x, Intersections[2 + i].y, 1.0 - Intersections[2 + i].z);
            }

            return geometry;
        }

        //Usporiada body polygonu postupne
        function sortIntersections() {
            var SortedIntersections = [];

            //Vlozi prvy bod
            SortedIntersections.push(Intersections.shift());
            //Cykli kym v poli nejake body zostali
            for (; Intersections.length > 0;) {
                var lastIntersect = SortedIntersections[SortedIntersections.length - 1];
                //Prehladava ostatne body
                for (var i = 0; i < Intersections.length; i++) {
                    //ak maju spolocnu hranu s poslednym tak je to nasledujuci bod
                    if( (Intersections[i].x == 0.0 && lastIntersect.x == 0.0) || 
                        (Intersections[i].y == 0.0 && lastIntersect.y == 0.0) ||
                        (Intersections[i].z == 0.0 && lastIntersect.z == 0.0) ||
                        (Intersections[i].x == 1.0 && lastIntersect.x == 1.0) ||
                        (Intersections[i].y == 1.0 && lastIntersect.y == 1.0) ||
                        (Intersections[i].z == 1.0 && lastIntersect.z == 1.0))
                    {
                        SortedIntersections.push(Intersections[i]);
                        Intersections.splice(i, 1);
                        break;
                    }
                }
            }

            Intersections = SortedIntersections;
        }

        function getPlane() {
            var viewportPosition = Camera.position.clone();

            //vektor normaly
            var normal = OrbitControl.target.clone();
            normal.sub(viewportPosition);
            var normalized = normal.clone().normalize();
            viewportPosition.add(normalized.multiplyScalar(camera.near+0.001))

            //vzdialenost k pociatku sur. sustavy
            var cPos = viewportPosition.clone();
            cPos.negate();
            var angle = cPos.angleTo(normal);
            var cosin = Math.cos(angle);
            var len = viewportPosition.length();
            var distance = cosin * len;

            //normal.negate();
            return new THREE.Plane(normal.normalize(), distance)
        }
    }

}());

