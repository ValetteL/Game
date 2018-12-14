var container, gui, construction, scene, camera, renderer, controls, planet, building;
var radius = 1000;
var construct = false;


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersects;
var pointOfIntersection = new THREE.Vector3();
var localPoint = new THREE.Vector3();
var spherical = new THREE.Spherical();
var lat, lon;
var clock = new THREE.Clock();
var delta = 0;
const center = new THREE.Vector3();

const source = {
    phi: 0,
    theta: 0
};
const target = {
    phi: 0,
    theta: 0
};

init();
animate();

function init(){
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 10, 10000 );
    camera.position.z = 2000;

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 1 );
    container.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    drawStars();

    // DAT.GUI Related Stuff
    gui = new dat.GUI();
    construction = gui.addFolder('Building');
    construction.add(this, 'construct');
    construction.open();

    drawPlanet();

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add(light);

    var fillLight = new THREE.AmbientLight( 0x2e1527 );
    scene.add(fillLight);

    building = new THREE.Group();
    planet.add(building);
}

function drawPlanet(){
    planet = new THREE.Object3D();
    var geometryBase = new THREE.SphereGeometry(radius, 100, 100);
    var terranGeom = new THREE.SphereGeometry(radius-1, 40, 30);
    var terranHighGeom = new THREE.SphereGeometry(radius-5, 20, 20);

    var water = new THREE.MeshLambertMaterial({
        color: '#1f9fff',
        flatShading: true
    });

    var ground = new THREE.MeshLambertMaterial({
        color: '#8bb55b',
        flatShading: true
    });


    var highTerranMat= new THREE.MeshLambertMaterial({
        color: '#ffb573',
        flatShading: true
    });

    geometryBase.vertices.forEach (function (v){
        v[["x","y","z"][~~(Math.random() * 3)]] += Math.random() * 10;
    });


    [terranHighGeom.vertices, terranGeom.vertices].forEach(function (g){
        g.forEach(function (v){
            v[["x","y","z"][~~(Math.random() * 6)]] += Math.random() * 40;
        });
    });


    var base = new THREE.Mesh(geometryBase, water);
    var terran = new THREE.Mesh(terranGeom, ground);
    var highTerran = new THREE.Mesh(terranHighGeom, highTerranMat);

    planet.add(base, terran, highTerran);

    scene.add(planet);
}

function drawStars(){
    var totalStars = 400;
    var geometry = new THREE.Geometry();

    for (var i = 0; i < totalStars; i++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random()* (10000 + 10000) - 10000;
        vertex.y = Math.random()* (10000 + 10000) - 10000;
        vertex.z = Math.random()* (10000 + 10000) - 10000;
        geometry.vertices.push( vertex );
    }

    var material = new THREE.PointsMaterial( { size: 6 });
    var particles = new THREE.Points( geometry, material );

    scene.add( particles );
}

window.addEventListener( 'resize', function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}, false );

function animate()
{
    requestAnimationFrame(animate);
    update();
    render();
}

window.addEventListener("mousedown", sphereClick, false);

function sphereClick(event) {
    if(this.construct == true) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(planet.children);
        console.log(intersects);
        if (intersects.length == 0) return;
        pointOfIntersection = intersects[0].point;
        planet.worldToLocal(localPoint.copy(pointOfIntersection));
        createPoint(localPoint);
    }
}

function createPoint(position) {
    var point = new THREE.Mesh(new THREE.SphereGeometry( 5, 5, 5 ), new THREE.MeshBasicMaterial({
        color: 0x777777 + Math.random() * 0x777777
    }));
    point.position.copy(position);
    point.position.z += 2;
    planet.add(point);
    var color = point.material.color.getHexString();
    spherical.setFromVector3(position);
    lat = THREE.Math.radToDeg(Math.PI / 2 - spherical.phi);
    lon = THREE.Math.radToDeg(spherical.theta);
    /*pointList.innerHTML += "<span style='color:#" + color + "'>lat: " + lat + ";  lon: " + lon + "</span><br>";*/
}

function update()
{
    //delta = clock.getDelta();
    //planet.rotation.y += THREE.Math.degToRad(-1) * delta;
}

function render()
{
    renderer.render( scene, camera );
}

render();





