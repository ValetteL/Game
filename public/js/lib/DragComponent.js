const plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let offset = new THREE.Vector3();
let intersection = new THREE.Vector3();
let INTERSECTED;
let SELECTED;
let mdown = -1;

class DragComponent {
    constructor(renderingContext, view) {
        this.renderingContext = renderingContext;
        this.view = view;
        this.objects = [];
    }

    initialize() {
        this.renderingContext.renderer.domElement.addEventListener('mousemove', (e) => this.onDocumentMouseMove(e), false);
        this.renderingContext.renderer.domElement.addEventListener('mousedown', (e) => this.onDocumentMouseDown(e), false);
        this.renderingContext.renderer.domElement.addEventListener('mouseup', (e) => this.onDocumentMouseUp(e), false);
    }

    get camera() {
        return this.renderingContext.camera;
    }

    get controls() {
        return this.renderingContext.controls;
    }

    addObject(object) {
        this.objects.push(object);
    }

    clearObjects() {
        this.objects = [];
        INTERSECTED = null;
        SELECTED = null;
    }

    onDocumentMouseMove( event ) {
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( mouse, this.camera );
        if ( SELECTED ) {
            if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
                SELECTED.position.copy( intersection.sub( offset ) );

                SELECTED.onDrag();
            }
            return;
        }
        const intersects = raycaster.intersectObjects( this.objects );
        if ( intersects.length > 0 ) {
            if ( INTERSECTED != intersects[ 0 ].object ) {
                INTERSECTED = intersects[ 0 ].object;
                plane.setFromNormalAndCoplanarPoint(
                    this.camera.getWorldDirection( plane.normal ),
                    INTERSECTED.position );
            }
            this.renderingContext.renderer.domElement.style.cursor = 'pointer';
        } else {
            INTERSECTED = null;
            this.renderingContext.renderer.domElement.style.cursor = 'auto';
        }
    }

    onDocumentMouseDown( event ) {
        event.preventDefault();
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            this.controls.enabled = false;
            SELECTED = intersects[0].object;
            if (raycaster.ray.intersectPlane(plane, intersection)) {
                if(mdown == -1) {
                    mdown = setInterval(this.whileMouseDown, 100);
                }
            }
            this.renderingContext.renderer.domElement.style.cursor = 'move';

            this.view.onObjectClicked(SELECTED, event.shiftKey, event.ctrlKey);
        }
    }

    whileMouseDown(){
        SELECTED.position.x -= 0.1;
        SELECTED.position.y -= 0.1;
        SELECTED.position.z -= 0.1;
        offset.copy(intersection).sub(SELECTED.position);
        SELECTED.onDrag();
    }

    onDocumentMouseUp( event ) {
        if(mdown !== -1){
            clearInterval(mdown);
            mdown = -1;
        }
        event.preventDefault();
        this.controls.enabled = true;
        if ( INTERSECTED ) {
            SELECTED = null;
        }
        this.renderingContext.renderer.domElement.style.cursor = 'auto';
    }

}