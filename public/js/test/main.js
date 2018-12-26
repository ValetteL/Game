/*
//Acos
const delta = 0.001;
const keyFactor = 1000;

class Acos {
    constructor() {
        this.values = [];

        for (let x = 0; x <= 1; x += delta) {
            this.values[this.getKey(x)] = Math.acos(x);
        }

        this.values[this.getKey(1)] = Math.acos(1);

        for (let x = 0; x >= -1; x -= delta) {
            this.values[this.getKey(x)] = Math.acos(x);
        }

        this.values[this.getKey(-1)] = Math.acos(-1);

    }

    getKey(x) {
        if (x < 0) {
            return keyFactor + Math.round(x * -keyFactor);
        }

        return Math.round(x * keyFactor);
    }

    evaluate(x) {
        return this.values[this.getKey(x)];
    }
}

//CoordinateCalculator
const acos = new Acos();


class CoordinateCalculator {
    constructor() {
        this.vertexI = new THREE.Vector3();
        this.vertexJ = new THREE.Vector3();
        this.vertexK = new THREE.Vector3();
        this.iXj = new THREE.Vector3();
    }

    getCoordinate(vertex, boundaryVertex, triangles) {
        let wI = 0;

        for (let j = 0; j < triangles.length; j++) {
            wI += this.getPiFactor(vertex, triangles[j]);
        }

        return wI / vertex.distanceTo(boundaryVertex);
    }

    getPiFactor(v, triangle) {
        this.vertexI.copy(triangle[0]).sub(v).normalize();
        this.vertexJ.copy(triangle[1]).sub(v).normalize();
        this.vertexK.copy(triangle[2]).sub(v).normalize();

        const angleJK =  this.angleBetweenVectors(this.vertexJ, this.vertexK);
        const angleIJ = this.angleBetweenVectors(this.vertexI, this.vertexJ);
        const angleKI = this.angleBetweenVectors(this.vertexK, this.vertexI);

        this.iXj.copy(this.vertexI).cross(this.vertexJ);
        const nJK = this.vertexJ.cross(this.vertexK);
        const nKI = this.vertexK.cross(this.vertexI);

        nJK.normalize();

        return (angleJK + this.iXj.dot(nJK) * angleIJ / this.iXj.length() + nKI.dot(nJK) * angleKI / nKI.length()) / (this.vertexI.dot(nJK) * 2);
    }

    angleBetweenVectors (v, w) {
        var theta = v.dot( w ) / ( Math.sqrt( w.lengthSq() * v.lengthSq() ) );

        return acos.evaluate( THREE.Math.clamp( theta, - 1, 1 ) );
    }
}

//VertexTriangleMap
class VertexTrianglesMap {
    constructor(geometry) {
        this.vertices = this.getVertexTrianglesMap(geometry);
    }

    getVertexTrianglesMap(geometry) {
        const vertices = [];

        for (let i = 0; i < geometry.numVertices; i++) {
            vertices.push([]);
        }

        for (let i = 0; i < geometry.numFaces; i++) {
            const face = geometry.getFace(i);
            const vertexA = geometry.getVertex(face.a);
            const vertexB = geometry.getVertex(face.b);
            const vertexC = geometry.getVertex(face.c);

            vertices[face.a].push([vertexA, vertexB, vertexC]);
            vertices[face.b].push([vertexB, vertexC, vertexA]);
            vertices[face.c].push([vertexC, vertexA, vertexB]);
        }

        return vertices;
    }

    get length() {
        return this.vertices.length;
    }

    getTriangles(index) {
        return this.vertices[index];
    }

}

//MeanValueCoordinates
class MeanValueCoordinates {
    constructor(geometry) {
        this.geometry = geometry;
        this.trianglesByVertex = new VertexTrianglesMap(this.geometry);
        this.coordinateCalculator = new CoordinateCalculator();
    }

    getCoordinates(vertex) {
        const result = [];
        let sum = 0;

        for (let vertexIndex = 0; vertexIndex < this.trianglesByVertex.length; vertexIndex++) {
            const boundaryVertex = this.geometry.getVertex(vertexIndex);
            const triangles = this.trianglesByVertex.getTriangles(vertexIndex);
            const coordinate = this.coordinateCalculator.getCoordinate(vertex, boundaryVertex, triangles);

            result.push(coordinate);
            sum += coordinate;
        }

        for (let i = 0; i < result.length; i++) {
            result[i] /= sum;
        }

        return result;
    }

    evaluate(coordinates) {
        const result = new THREE.Vector3();
        let total = 0;

        for (let vertexIndex = 0; vertexIndex < coordinates.length; vertexIndex++) {
            const coefficient = coordinates[vertexIndex];

            if (coefficient > 0) {
                const boundaryVertex = this.geometry.getVertex(vertexIndex);

                result.add(boundaryVertex.clone().multiplyScalar(coefficient));
                total += coefficient;
            }
        }

        result.divideScalar(total);

        return result;
    }
}

//UnindexedBufferGeometryAdapter
class UnIndexedBufferGeometryAdapter {

    constructor(bufferGeometry) {
        this.bufferGeometry = bufferGeometry;
        this.positions = bufferGeometry.attributes.position.array;
    }

    get numVertices() {
        return this.positions.length / 3;
    }

    get numFaces() {
        return this.numVertices;
    }

    setVertex(index, x, y, z) {
        const offsetPosition = 3 * index;

        this.positions[offsetPosition] = x;
        this.positions[offsetPosition + 1] = y;
        this.positions[offsetPosition + 2] = z;
    }

    setVertexX(index, x) {
        this.positions[3 * index] = x;
    }

    setVertexY(index, y) {
        this.positions[3 * index + 1] = y;
    }

    setVertexZ(index, z) {
        this.positions[3 * index + 2] = z;
    }

    getVertex(index) {
        const offsetPosition = 3 * index;

        return new THREE.Vector3(this.positions[offsetPosition], this.positions[offsetPosition + 1], this.positions[offsetPosition + 2]);
    }

    getVertexX(index) {
        return this.positions[3 * index];
    }

    getVertexY(index) {
        return this.positions[3 * index + 1];
    }

    getVertexZ(index) {
        return this.positions[3 * index + 2];
    }

    getFace(index) {
        const offsetPosition = 3 * index;

        return new THREE.Face3(offsetPosition, offsetPosition + 1, offsetPosition + 2);
    }

    getFaceVertices(index) {
        const offsetPosition = 3 * index;

        return {
            a: this.getVertex(offsetPosition),
            b: this.getVertex(offsetPosition + 1),
            c: this.getVertex(offsetPosition + 2)
        }
    }

    updateVertices() {
        this.bufferGeometry.attributes.position.needsUpdate = true;
        this.bufferGeometry.attributes.normal.needsUpdate = true;
        this.bufferGeometry.computeVertexNormals();
    }

    updateFaces() {
        this.updateVertices();
    }

    getBoundingBox() {
        this.bufferGeometry.computeBoundingBox();

        return this.bufferGeometry.boundingBox;
    }

}

//IndexedBufferGeometryAdapter
class IndexedBufferGeometryAdapter extends UnIndexedBufferGeometryAdapter {
    constructor(bufferGeometry) {
        super(bufferGeometry);
        this.indices = bufferGeometry.index.array;
    }

    get numFaces() {
        return this.indices.length  / 3;
    }

    getFace(index) {
        const offsetPosition = 3 * index;

        return new THREE.Face3(this.indices[offsetPosition], this.indices[offsetPosition + 1], this.indices[offsetPosition + 2]);
    }

    getFaceVertices(index) {
        const offsetPosition = 3 * index;

        return {
            a: this.getVertex(this.indices[offsetPosition]),
            b: this.getVertex(this.indices[offsetPosition + 1]),
            c: this.getVertex(this.indices[offsetPosition + 2])
        }
    }

    updateFaces() {
        this.bufferGeometry.index.needsUpdate = true;
    }
}

//GeometryAdapter
class GeometryAdapter {

    constructor(geometry) {
        this.geometry = geometry;
    }

    get numVertices() {
        return this.geometry.vertices.length;
    }

    get numFaces() {
        return this.geometry.faces.length;
    }

    setVertex(index, x, y, z) {
        this.geometry.vertices[index].set(x, y, z);
    }

    setVertexX(index, x) {
        this.geometry.vertices[index].setX(x);
    }

    setVertexY(index, y) {
        this.geometry.vertices[index].setY(y);
    }

    setVertexZ(index, z) {
        this.geometry.vertices[index].setZ(z);
    }

    getVertex(index) {
        return this.geometry.vertices[index];
    }

    getVertexX(index) {
        return this.geometry.vertices[index].x;
    }

    getVertexY(index) {
        return this.geometry.vertices[index].y;
    }

    getVertexZ(index) {
        return this.geometry.vertices[index].z;
    }

    getFace(index) {
        return this.geometry.faces[index];
    }

    getFaceVertices(index) {
        const face = this.getFace(index);

        return {
            a: this.getVertex(face.a),
            b: this.getVertex(face.b),
            c: this.getVertex(face.c)
        }
    }

    updateVertices() {
        this.geometry.verticesNeedUpdate = true;
    }

    updateFaces() {
        this.geometry.elementsNeedUpdate = true;
    }
}

//GeometryAdapterFactory
class GeometryAdapterFactory {

    getAdapter(geometry) {
        const hasPositionAtrr = geometry.attributes && geometry.attributes.position;

        if (hasPositionAtrr) {
            if (geometry.index) {
                return new IndexedBufferGeometryAdapter(geometry);
            } else {
                return new UnIndexedBufferGeometryAdapter(geometry);
            }
        } else {
            return new GeometryAdapter(geometry);
        }
    }
}

//Observable
class Observable {
    constructor() {
        this.observers = new Map();
    }

    addObserver(label, callback) {
        this.observers.has(label) || this.observers.set(label, []);
        this.observers.get(label).push(callback);
    }

    removeObserver(label) {
        this.observers.delete(label);
    }

    emit(label, e) {
        const observers = this.observers.get(label);

        if (observers && observers.length) {
            observers.forEach((callback) => {
                callback(e);
            });
        }
    }

}

// Lattice
const adapterFactory = new GeometryAdapterFactory();

class Lattice extends Observable {
    constructor(geometry,numDivisions) {
        super();
        this.geometry = geometry;
        this.numDivisions = numDivisions;
        this.makeLatticeObject();
        this.controlPoints = this.getControlPoints();
    }

    getBoundingBox() {
        const bbox = new THREE.Box3().setFromObject(this.latticeMesh);

        return bbox;
    }

    makeLatticeObject() {
        const bbox = this.geometry.getBoundingBox();

        this.size = bbox.max.clone().sub(bbox.min);
        const center = bbox.min.clone().add(this.size.clone().divideScalar(2));

        this.size.multiplyScalar(1.1);

        const latticeBoxGeometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z, this.numDivisions, this.numDivisions, this.numDivisions);

        latticeBoxGeometry.translate(center.x, center.y, center.z);

        this.latticeMesh = new THREE.Mesh(latticeBoxGeometry, new THREE.MeshBasicMaterial({color: 0x333333, wireframe: true, wireframeLinewidth: 1 }));
        this.latticeGeometry = adapterFactory.getAdapter(latticeBoxGeometry);
    }

    getControlPoints() {
        const objects = [];

        for (let vertexIndex = 0; vertexIndex < this.latticeGeometry.numVertices; vertexIndex++) {
            const mesh = this.getControlPointMesh(vertexIndex);

            objects.push(mesh);
        }

        const bbox = this.getBoundingBox();

        const planes = [];
        planes.push(this.getPointsOnPlane(objects, bbox.min.x, null , null));
        planes.push(this.getPointsOnPlane(objects, bbox.max.x, null , null));
        planes.push(this.getPointsOnPlane(objects, null , bbox.min.y, null));
        planes.push(this.getPointsOnPlane(objects, null , bbox.max.y, null));
        planes.push(this.getPointsOnPlane(objects, null , null , bbox.min.z));
        planes.push(this.getPointsOnPlane(objects, null , null , bbox.max.z));

        for (const controlPoints of planes) {
            for (const controlPoint of controlPoints) {
                for (const controlPointAdjacent of controlPoints) {
                    controlPoint.adjacentPoints.add(controlPointAdjacent);
                }
            }
        }

        return objects;
    }

    getPointsOnPlane(controlPoints, x, y, z) {
        const delta = 0.1;
        const result = [];
        for (const controlPoint of controlPoints) {
            if (
                (!x || Math.abs(controlPoint.position.x - x) < delta)
                &&  (!y || Math.abs(controlPoint.position.y - y) < delta)
                &&  (!z || Math.abs(controlPoint.position.z - z) < delta)
            ) {
                result.push(controlPoint);
            }
        }

        return result;
    }

    updateControlPointsPosition() {
        for (const controlPoint of this.controlPoints) {
            controlPoint.position.copy(this.getVertex(controlPoint.vertexIndex));
        }
    }

    getWorldPositon(position) {
        return this.latticeMesh.localToWorld(position.clone())
    }

    getLocalPositon(position) {
        return this.latticeMesh.worldToLocal(position.clone())
    }

    getVertex(vertexIndex) {
        const position = this.latticeGeometry.getVertex(vertexIndex);

        return this.getWorldPositon(position);
    }

    get numVertices() {
        return this.latticeGeometry.numVertices;
    }

    get numFaces() {
        return this.latticeGeometry.numFaces;
    }

    getFace(i) {
        return this.latticeGeometry.getFace(i);
    }

    getControlPointMesh(vertexIndex) {
        const vertex = this.latticeGeometry.getVertex(vertexIndex);
        const box = new THREE.SphereGeometry(0.1, 32, 32);
        const mesh = new THREE.Mesh(box, Lattice.ControlPointMaterial);

        mesh.position.copy(vertex);
        mesh.vertexIndex = vertexIndex;
        mesh.adjacentPoints = new Set();

        mesh.onDrag = () => {
            const delta = mesh.position.clone().sub(this.getVertex(vertexIndex));

            this.emit('onDrag', { delta, object: mesh });
        };

        return mesh;
    }

    set isVisible(visible) {
        this.latticeMesh.visible = visible;

        this.controlPointsVisible = visible;
    }

    set controlPointsVisible(visible) {
        for (const controlPoint of this.controlPoints) {
            controlPoint.visible = visible;
        }
    }
}

Lattice.ControlPointMaterial = new THREE.MeshStandardMaterial({
    color: 'black',
    emissive: 0,
    metalness: 0.2,
    side: 2,
    roughness: 0.5
});

Lattice.SelectedControlPointMaterial = new THREE.MeshStandardMaterial({
    color: 'green',
    emissive: 0,
    metalness: 0.2,
    side: 2,
    roughness: 0.5
});

//RenderingContext
class RenderingContext {
    constructor(scene, camera, renderer, controls) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
    }

    static getDefault(containerElement) {
        const width  = window.innerWidth, height = window.innerHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        const renderer = new THREE.WebGLRenderer();
        const controls = new THREE.OrbitControls(camera, renderer.domElement);

        camera.position.z = 30;
        renderer.setSize(width, height);
        renderer.setClearColor(0xf0f0f0, 1);
        scene.add(new THREE.AmbientLight(0xffffff));

        const light = new THREE.DirectionalLight(0xffffff, 1);

        light.position.set(15,15,15);
        scene.add(light);

        containerElement.appendChild(renderer.domElement);

        return new RenderingContext(scene, camera, renderer, controls);
    }
}

// View
class MainView {
    constructor(controller) {
        this.controller = controller;
        this.renderingContext = this.createRenderingContext();
        this.dragComponent = new DragComponent(this.renderingContext, this);
        this.container = new THREE.Object3D();
        this.scene.add(this.container);
    }

    createRenderingContext() {
        const domContainer = document.getElementById('container');

        return RenderingContext.getDefault(domContainer);
    }

    initialize() {
        this.initGUI();
        window.addEventListener( 'resize', (e) => this.onWindowResize(), false );
        window.addEventListener( 'keydown', (e) => this.onKeyPress(e), false );
        this.dragComponent.initialize();
        this.render();
    }

    render() {
        this.renderingContext.controls.update();
        requestAnimationFrame(() => this.render());

        this.renderingContext.renderer.render(this.renderingContext.scene, this.camera);
    }

    onWindowResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderingContext.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    get scene() {
        return this.renderingContext.scene;
    }

    get camera() {
        return this.renderingContext.camera;
    }

    get renderer() {
        return this.renderingContext.renderer;
    }

    addDraggableObject(object) {
        this.container.add(object);
        this.dragComponent.addObject(object);
    }

    addObject(object) {
        this.container.add(object);
    }

    clearObjects() {
        this.removeTransformControl();
        this.scene.remove(this.container);
        this.dragComponent.clearObjects();
        this.container = new THREE.Object3D();
        this.scene.add(this.container);
    }

    initGUI() {
        this.uiSettings = {
            mesh: 'sphere',
            editLattice: false,
            showTransformControls: false,
            vertexSize: 1,
            divisions: 1,
            showLattice: false,
            modify: false
        };
        const gui = new dat.GUI();

        gui.add( this.uiSettings, "mesh", ['sphere', 'dog', 'stayPuft'] ).onChange( () => this.controller.setModel(this.uiSettings.mesh));
        gui.add( this.uiSettings, "showLattice", true ).onChange( () => this.controller.onShowLatticeChange(this.uiSettings.showLattice));
        gui.add( this.uiSettings, "showTransformControls", true ).onChange( () => {
            if (this.uiSettings.showTransformControls) {
                this.addTransformControl(this.controller.lattice.latticeMesh);
            } else {
                this.removeTransformControl();
            }
        });
        gui.add( this.uiSettings, "editLattice", true ).onChange( () => this.controller.onEditLatticeChange(this.uiSettings.editLattice));
        gui.add( this.uiSettings, "vertexSize", 1, 5 ).onChange( () => this.controller.setLatticeVertexSize(this.uiSettings.vertexSize));
        gui.add( this.uiSettings, "divisions", [1, 2, 3] ).onChange( () => {
            this.clearObjects();
            this.controller.reloadModel()
        });
        gui.add( this.uiSettings, "modify", false );
    }

    onObjectClicked(object, shiftKey, ctrlKey) {
        this.controller.onControlPointSelect(object, shiftKey, ctrlKey);
    }

    onKeyPress(event) {
        if (this.control) {
            switch (event.keyCode) {
                case 87: // W
                    this.control.setMode("translate");
                    break;

                case 69: // E
                    this.control.setMode("rotate");
                    break;

                case 82: // R
                    this.control.setMode("scale");
                    break;

                case 187:
                case 107: // +, =, num+
                    this.control.setSize(this.control.size + 0.1);
                    break;

                case 189:
                case 109: // -, _, num-
                    this.control.setSize(Math.max(this.control.size - 0.1, 0.1));
                    break;
            }
        }
    }

    addTransformControl(mesh) {
        this.control = new THREE.TransformControls( this.camera, this.renderer.domElement );
        this.control.addEventListener( 'change', () => this.render() );
        this.control.addEventListener( 'objectChange', () => {
            this.controller.lattice.updateControlPointsPosition();

            if (!this.uiSettings.editLattice) {
                this.controller.updateTargetVertices();
            }
        });

        this.control.attach( mesh );

        this.control.visible = this.uiSettings.showTransformControls;

        this.container.add( this.control );
    }

    removeTransformControl() {
        if (this.control) {
            this.control.detach();
            this.container.remove(this.control);
            this.control = null;
        }
    }
}

//Controller
const material = new THREE.MeshPhongMaterial( { color: 0x3f2806 } );

material.color.offsetHSL( 0.1, -0.1, 0 );

const loader = new THREE.GLTFLoader();
const adapterFactoryController = new GeometryAdapterFactory();

class Controller {
    constructor() {
        this.currentModel = 'sphere';
        this.view = new MainView(this);
        this.view.initialize();
        this.selectedControlPoints = new Set();

        this.initialize();
    }

    initialize() {
        this.reloadModel();
    }

    onShowLatticeChange(showLattice) {
        this.lattice.isVisible = showLattice;
        if (this.view.control) {
            this.view.control.visible = showLattice;
        }
    }

    setLatticeVertexSize(size) {
        for (const controlPoint of this.lattice.controlPoints) {
            controlPoint.scale.x = size;
            controlPoint.scale.y = size;
            controlPoint.scale.z = size;
        }
    }

    onEditLatticeChange(editLattice) {
        if (!editLattice) {
            this.setupLattice();
        }
    }

    onControlPointSelect(object, shiftKey, ctrlKey) {
        if (!this.selectedControlPoints.has(object)) {
            if (!shiftKey) {
                this.clearSelection();
            }
            this.selectedControlPoints.add(object);
            object.material = Lattice.SelectedControlPointMaterial.clone();
        }

        if (ctrlKey) {
            for (const neighborObject of object.adjacentPoints) {
                this.selectedControlPoints.add(neighborObject);
                neighborObject.material = Lattice.SelectedControlPointMaterial.clone();
            }
        }
    }

    clearSelection() {
        for (const controlPoint of this.selectedControlPoints) {
            controlPoint.material = Lattice.ControlPointMaterial.clone();
        }

        this.selectedControlPoints.clear();
    }

    setModel(model) {
        this.view.clearObjects();
        this.currentModel = model;
        this.reloadModel();
    }

    reloadModel() {
        this.getGeometryByIndex()
            .then((geometry) => {
                const mesh = new THREE.Mesh( geometry, material );
                console.log(mesh);
                this.view.addObject( mesh );

                this.geometryAdapter = adapterFactoryController.getAdapter(geometry);
                this.lattice = new Lattice(this.geometryAdapter, this.view.uiSettings.divisions);

                this.view.addObject(this.lattice.latticeMesh);

                for (const controlPoint of this.lattice.controlPoints) {
                    this.view.addDraggableObject(controlPoint);
                }

                this.setupLattice();
            });
    }

    getGeometryByIndex() {
        const index = this.currentModel;
        return new Promise( function (resolve, reject) {
            if (index == 'sphere') {
                console.log(new THREE.SphereBufferGeometry(3, 32, 32));
                resolve(new THREE.SphereBufferGeometry(3, 32, 32));
            } else {
                const fileName = 'planet.gltf';
                loader.load('./ressources/' + fileName, function (gltf) {
                    //console.log(gltf);
                    gltf.scene.traverse(function (child){
                        //console.log(child);
                        if(child.isMesh){
                            resolve(child.geometry);
                        }
                    });

                });
            }
        });
    }

    setupLattice() {
        this.mvc = new MeanValueCoordinates(this.lattice);
        this.coordinates = [];

        const latticeBundingBox = this.lattice.getBoundingBox();

        for (let vertexIndex = 0; vertexIndex < this.geometryAdapter.numVertices; vertexIndex++) {
            const v = this.geometryAdapter.getVertex(vertexIndex);
            const vertexCoordinates = latticeBundingBox.containsPoint(v) ?  this.mvc.getCoordinates(v) : null;

            this.coordinates.push(vertexCoordinates);
        }

        this.lattice.removeObserver('onDrag');
        this.lattice.addObserver('onDrag', (e) => this.onLatticeDrag(e));

        this.view.removeTransformControl();
        if (this.view.uiSettings.showTransformControls) {
            this.view.addTransformControl(this.lattice.latticeMesh);
        }
    }

    onLatticeDrag(e) {
        //console.log(e.object);
        const delta = e.delta;
        const object = e.object;

        for (const controlPoint of this.selectedControlPoints) {
            const newVertexPosition = this.lattice.getVertex(controlPoint.vertexIndex).clone().add(delta);
            const localPosition = this.lattice.getLocalPositon(newVertexPosition);

            this.lattice.latticeGeometry.setVertex(controlPoint.vertexIndex, localPosition.x, localPosition.y, localPosition.z);

            if (object != controlPoint) {
                controlPoint.position.copy(newVertexPosition);
            }
        }

        this.lattice.latticeGeometry.updateVertices();

        this.updateTargetVertices();
    }

    updateTargetVertices() {
        for (let vertexIndex = 0; vertexIndex < this.coordinates.length; vertexIndex++) {
            const vertexCoordinates = this.coordinates[vertexIndex];

            if (vertexCoordinates) {
                const position = this.mvc.evaluate(vertexCoordinates);

                this.geometryAdapter.setVertex(vertexIndex, position.x, position.y, position.z);
            }
        }

        this.geometryAdapter.updateVertices();
    }
}

const controller = new Controller();
//window.addEventListener("mousedown", sphereClick, false);

function sphereClick(event) {
    console.log(controller);
    if(controller.view.uiSettings.modify == true) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, controller.view.renderingContext.camera);
        intersects = raycaster.intersectObjects(controller.geometryAdapter.bufferGeometry);
        console.log(intersects);
        if (intersects.length == 0) return;
        this.mvc = new MeanValueCoordinates(this.lattice);
        this.coordinates = [];

        const latticeBundingBox = this.lattice.getBoundingBox();

        for (let vertexIndex = 0; vertexIndex < this.geometryAdapter.numVertices; vertexIndex++) {
            const v = this.geometryAdapter.getVertex(vertexIndex);
            const vertexCoordinates = latticeBundingBox.containsPoint(v) ?  this.mvc.getCoordinates(v) : null;

            this.coordinates.push(vertexCoordinates);
        }

        this.lattice.removeObserver('onDrag');
        this.lattice.addObserver('onDrag', (e) => this.onLatticeDrag(e));

        this.view.removeTransformControl();
        if (this.view.uiSettings.showTransformControls) {
            this.view.addTransformControl(this.lattice.latticeMesh);
        }
        //modifyPlanet(intersects[ 0 ].object);
    }
    if(this.construct == true) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(planet.children);
        //console.log(intersects);
        if (intersects.length == 0) return;
        createPoint(intersects[ 0 ].point, intersects[ 0 ].face.normal);
    }
}

function modifyPlanet(object) {
    console.log(object.geometry.index.itemSize/!*object.geometry.index*!/);
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

animate();
function animate()
{
    requestAnimationFrame(animate);
}
*/


//Renderer Elements
var ctx = document.body.appendChild(document.createElement('canvas')).getContext('2d'),
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

document.body.appendChild(renderer.domElement);
renderer.domElement.style.position =
    ctx.canvas.style.position = 'fixed';
ctx.canvas.style.background = 'black';

function resize() {
    var ratio = 16 / 9,
        preHeight = window.innerWidth / ratio;

    if (preHeight <= window.innerHeight) {
        renderer.setSize(window.innerWidth, preHeight);
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = preHeight;
    } else {
        var newWidth = Math.floor(window.innerWidth - (preHeight - window.innerHeight) * ratio);
        newWidth -= newWidth % 2 !== 0 ? 1 : 0;
        renderer.setSize(newWidth, newWidth / ratio);
        ctx.canvas.width = newWidth;
        ctx.canvas.height = newWidth / ratio;
    }

    renderer.domElement.style.width = '';
    renderer.domElement.style.height = '';
    renderer.domElement.style.left = ctx.canvas.style.left = (window.innerWidth - renderer.domElement.width) / 2 + 'px';
    renderer.domElement.style.top = ctx.canvas.style.top = (window.innerHeight - renderer.domElement.height) / 2 + 'px';
}

window.addEventListener('resize', resize);

resize();

//Scene and Camera
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
    20, // Field of view
    16 / 9, // Aspect ratio
    0.1, // Near plane
    10000 // Far plane
);

camera.position.set(700, 235, 0);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 1;

//Objects
var starColor = (function() {
        var colors = [0xFFFF00, 0x559999, 0xFF6339, 0xFFFFFF];
        return colors[Math.floor(Math.random() * colors.length)];
    })(),
    star = new THREE.Mesh(
        new THREE.IcosahedronGeometry(7, 1),
        new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
        })
    ),
    glows = [];

star.castShadow = false;
scene.add(star);

for (var i = 1, scaleX = 1.1, scaleY = 1.1, scaleZ = 1.1; i < 5; i++) {
    var starGlow = new THREE.Mesh(
        new THREE.IcosahedronGeometry(7, 1),
        new THREE.MeshBasicMaterial({
            color: starColor,
            transparent: true,
            opacity: 0.5
        })
    );
    starGlow.castShadow = false;
    scaleX += 0.4 + Math.random() * .5;
    scaleY += 0.4 + Math.random() * .5;
    scaleZ += 0.4 + Math.random() * .5;
    starGlow.scale.set(scaleX, scaleY, scaleZ);
    starGlow.origScale = {
        x: scaleX,
        y: scaleY,
        z: scaleZ
    };
    glows.push(starGlow);
    scene.add(starGlow);
}

var planetColors = [
        0x333333, //grey
        0x993333, //ruddy
        0xAA8239, //tan
        0x2D4671, //blue
        0x599532, //green
        0x267257 //bluegreen
    ],
    planets = [];

for (var p = 0, radii = 0; p < 5; p++) {
    var size = 4 + Math.random() * 7,
        type = Math.floor(Math.random() * planetColors.length),
        roughness = Math.random() > .6 ? 1 : 0,
        planetGeom = new THREE.Mesh(
            new THREE.IcosahedronGeometry(size, roughness),
            new THREE.MeshLambertMaterial({
                color: planetColors[type],
                flatShading: true,
            })
        ),
        planet = new THREE.Object3D();

    planet.add(planetGeom);

    if (type > 1 && Math.random() > 0.5) {
        var atmoGeom = new THREE.Mesh(
            new THREE.IcosahedronGeometry(size + 1.5, roughness),
            new THREE.MeshLambertMaterial({
                color: planetColors[3],
                flatShading: true,
                transparent: true,
                opacity: 0.5
            })
        );

        atmoGeom.castShadow = false;
        planet.add(atmoGeom);
    }

    planet.orbitRadius = Math.random() * 50 + 50 + radii;
    planet.rotSpeed = 0.005 + Math.random() * 0.01;
    planet.rotSpeed *= Math.random() < .10 ? -1 : 1;
    planet.rot = Math.random();
    planet.orbitSpeed = (0.02 - p * 0.0048) * 0.25;
    planet.orbit = Math.random() * Math.PI * 2;
    planet.position.set(planet.orbitRadius, 0, 0);

    radii = planet.orbitRadius + size;
    planets.push(planet);
    scene.add(planet);

    var orbit = new THREE.Line(
        new THREE.CircleGeometry(planet.orbitRadius, 90),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: .05,
            side: THREE.BackSide
        })
    );
    orbit.geometry.vertices.shift();
    orbit.rotation.x = THREE.Math.degToRad(90);
    scene.add(orbit);
}

//Lights
var light1 = new THREE.PointLight(starColor, 2, 0, 0);

light1.position.set(0, 0, 0);
scene.add(light1);

var light2 = new THREE.AmbientLight(0x090909);
scene.add(light2);

//2D
var bgStars = [];

for (var i = 0; i < 500; i++) {
    var tw = {
        x: Math.random(),
        y: Math.random()
    }

    bgStars.push(tw);
}

//Main Loop
var t = 0;
function animate() {

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';

    for (var s in bgStars) {
        var q = bgStars[s],
            oX = q.x * ctx.canvas.width,
            oY = q.y * ctx.canvas.height,
            size = Math.random() < .9998 ? Math.random() : Math.random() * 3;

        ctx.beginPath();
        ctx.moveTo(oX, oY - size);
        ctx.lineTo(oX + size, oY);
        ctx.lineTo(oX, oY + size);
        ctx.lineTo(oX - size, oY);
        ctx.closePath();
        ctx.fill();
    }

    for (var p in planets) {
        var planet = planets[p];
        planet.rot += planet.rotSpeed;
        planet.rotation.set(0, planet.rot, 0);
        planet.orbit += planet.orbitSpeed;
        planet.position.set(Math.cos(planet.orbit) * planet.orbitRadius, 0, Math.sin(planet.orbit) * planet.orbitRadius);
    }
    t += 0.01;
    star.rotation.set(0, t, 0);
    for (var g in glows) {
        var glow = glows[g];
        glow.scale.set(
            Math.max(glow.origScale.x - .2, Math.min(glow.origScale.x + .2, glow.scale.x + (Math.random() > .5 ? 0.005 : -0.005))),
            Math.max(glow.origScale.y - .2, Math.min(glow.origScale.y + .2, glow.scale.y + (Math.random() > .5 ? 0.005 : -0.005))),
            Math.max(glow.origScale.z - .2, Math.min(glow.origScale.z + .2, glow.scale.z + (Math.random() > .5 ? 0.005 : -0.005)))
        );
        glow.rotation.set(0, t, 0);
    }

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}
animate();
