var container, gui, construction, scene, camera, renderer, controls, planet, building, loader, radius;
var construct = false;
var modify = false;
var ships = [];

const vector = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersects;
var spherical = new THREE.Spherical();
var clock = new THREE.Clock();
var delta = 0, radii = 0;

var r = 6;

init();
animate();

function init(){
    var ws = new WebSocket('ws://' + wsUrl);

    ws.onopen = function () {
        ws.send('Hello');
        console.log('Connected !');
    };

    ws.onmessage = function (event) {
        console.log(event.data);
    };

    ws.onclose = function () {
        console.log('Connection closed');
    };

    ws.onerror = function () {
        console.log('An error occured!');
    };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(15, 20, 30);
    scene.add(camera);

    container = document.getElementById( 'container' );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 8;
    controls.maxDistance = 1000;

    loader = new THREE.GLTFLoader();

    // DAT.GUI Related Stuff
    gui = new dat.GUI();
    construction = gui.addFolder('Building');
    construction.add(this, 'construct');
    construction.add(this, 'modify');
    construction.open();

    drawPlanet();
    drawStars();

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add(light);

    var fillLight = new THREE.AmbientLight( '#ae4f95' );
    scene.add(fillLight);

    building = new THREE.Group();
    scene.add(building);
}

function drawPlanet(){
    loader.load('./ressources/planet.gltf', function(gltf){
        planet = gltf.scene.children[0];
        //console.log(planet);
        scene.add(planet);
    }, undefined, function(error){
        console.error(error);
    });
}

function drawStars(){
    let totalStars = 600;
    let geometry = new THREE.Geometry();

    for (let i = 0; i < totalStars; i++)
    {
        let vertex = new THREE.Vector3();
        vertex.x = Math.random()* (1500 + 1500) - 1500;
        vertex.y = Math.random()* (1500 + 1500) - 1500;
        vertex.z = Math.random()* (1500 + 1500) - 1500;
        geometry.vertices.push( vertex );
    }

    let material = new THREE.PointsMaterial( { size: 2 });
    let particles = new THREE.Points( geometry, material );

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
    //console.log(planet);
    if(this.modify == true) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(planet.children);
        //console.log(intersects);
        if (intersects.length == 0) return;
        modifyPlanet(intersects[ 0 ].object);
    }
    if(this.construct == true) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(planet.children);
        //console.log(intersects);
        if (intersects.length == 0) return;
        buildObject(intersects[ 0 ].point);

    }
}

function modifyPlanet(object) {
        console.log(object.geometry.index.itemSize/*object.geometry.index*/);
        for (let i = 0; i < object.geometry.index.itemSize; i++) {
            // a single vertex Y position
            //console.log(object.geometry.index.getY(i));
            const yPos = object.geometry.index.getY(i);
            const twistAmount = 10;
            const upVec = new THREE.Vector3(0, 1, 0);

            object.quaternion.setFromAxisAngle(
                upVec,
                (Math.PI / 180) * (yPos / twistAmount)
            );

            //object.geometry.index.applyQuaternion(intersects[ 0 ].object.quaternion);
        }
    // tells Three.js to re-render this mesh
    object.geometry.verticesNeedUpdate = true;
}


function buildObject(position) {
    loader.load('./ressources/spaceKit/Models/GLTF/spaceShip.gltf', function(gltf){
        var ship = gltf.scene;
        //console.log(position);
        var size = 4 + Math.random() * 7;
        ship.position.copy(position);

        ship.orbitRadius = 8;
        ship.rotSpeed = 0.005 + 0.5 * 0.001;
        ship.rotSpeed *= 0.5 < .10 ? -1 : 1;
        ship.rot = 0.5;
        ship.orbitSpeed = (0.02 - (ships.length - 1) * 0.0048) * 0.25;
        ship.orbit = 0.5 * Math.PI * 2;
        ship.position.set(planet.orbitRadius, 0, 0);

        radii = ship.orbitRadius;

        ships.push(ship);
        building.add(ship);
    }, undefined, function(error){
        console.error(error);
    });
    /*pointList.innerHTML += "<span style='color:#" + color + "'>lat: " + lat + ";  lon: " + lon + "</span><br>";*/
}

function update()
{
    if(this.construct == true || this.modify == true){
        controls.enabled = false;
    } else {
        controls.enabled = true;
    }

    for (var s in ships) {
        var ship = ships[s];
        ship.rot += ship.rotSpeed;
        ship.rotation.y = ship.rot;
        ship.orbit += ship.orbitSpeed;
        ship.position.set(Math.cos(ship.orbit) * ship.orbitRadius, 0, Math.sin(ship.orbit) * ship.orbitRadius);
    }

    //delta = clock.getDelta();
    //building.rotation.y += THREE.Math.degToRad(9) * delta;

}

function render()
{
    renderer.render( scene, camera );
}

render();