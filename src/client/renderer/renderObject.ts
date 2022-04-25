import * as THREE from 'three';
import { Parity, Vertex } from '../SharedKernel/interfaces'
import { COLORS, STRANDS } from '../SharedKernel/constants';
import { DataContainer } from '../SharedKernel/dataContainer';
import { MyControls } from './MyControls';
import { convertHexToStringColor } from '../SharedKernel/utils';
import { TwoDView } from './views/twoDview';
import { View } from './interfaces/interfaces';
import { noDataView } from './views/noDataView';
import { updateLabel } from './utils/updateLabels';
import { CylinderView } from './views/cylinderView';
import { LatticeClickedEvent } from './events/latticeClicked';





export class RendererObject extends DataContainer {
    private renderer: THREE.Renderer = new THREE.WebGL1Renderer();
    private scene: THREE.Scene = new THREE.Scene();
    private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);;
    private controls: MyControls = new MyControls(this.camera, this.renderer.domElement);;
    private pointsPerLine: number = 40;
    private limit: number = 259;
    private drawFrom: number = 1;
    private verticesGroup: THREE.Group = new THREE.Group();
    private paritiesGroup: THREE.Group = new THREE.Group();
    private ghostGroup: THREE.Group = new THREE.Group();
    private rayCaster: THREE.Raycaster = new THREE.Raycaster();
    public  Simulating: boolean = true;
    private scale: number = 10;
    private radius: number = 2;
    private ghostgroupshow: boolean = true;
    private lineGeomIndex = 0;
    private ghostIndex = 0;
    private view: View;

    public set View(newView: number) {
        
        if(newView === 0) {
            this.view = new noDataView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls);
        } else if(newView === 1) {
            this.view = new TwoDView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls, this.camera);
        } else if(newView === 2) {
            this.view = new CylinderView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls, this.camera);
        } else {
            this.view = new TwoDView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls, this.camera);
        }
        this.view.UpdateData(this.alpha, this.s, this.p, this.vertices, this.parities, this.parityShift);
        this.view.HandleUpdatedData();
        this.Update();
    }

    constructor() {
        super();
        this.camera.position.z = 50;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.onclick = this.handleOnClick.bind(this);
        this.verticesGroup.name = "vertecies";
        this.scene.add(this.verticesGroup);
        this.paritiesGroup.name = "parities";
        this.scene.add(this.paritiesGroup);
        this.scene.add(this.ghostGroup);
        this.initObjects();
        this.view = new noDataView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls);
        this.animate();
    }

    public HandleUpdatedData() {
        this.initObjects();
        this.view = new TwoDView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls, this.camera);
        this.view.UpdateData(this.alpha, this.s, this.p, this.vertices, this.parities, this.parityShift);
        this.view.HandleUpdatedData();
    }

    private initObjects() {
        // this.limit = this.limit + (this.s - (this.limit % this.s));
        // this.drawFrom = 1;

        // Hvis listen av vertcies er mindre enn limit verdien.
        // if (this.vertices.size < this.limit) {
        //     this.limit = this.vertices.size
        // }

        // Lager n-antall verticies + parity
        this.fillVerteciesGroup();
        this.fillParitiesGroup();
        this.fillGhostGroup();
    }

    private fillVerteciesGroup() {
        var ctx: CanvasRenderingContext2D;
        var material: THREE.MeshBasicMaterial;
        var obj: THREE.Mesh;
        var geometry = new THREE.SphereGeometry(this.radius);
        while (this.verticesGroup.children.length <= this.limit) {
            ctx = document.createElement("canvas").getContext("2d")!;
            ctx.canvas.width = 256;
            ctx.canvas.height = 128;
            material = new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(ctx.canvas)
            });
            obj = new THREE.Mesh(geometry, material);
            obj.userData.ctx = ctx;
            obj.visible = false;
            this.verticesGroup.add(obj);
        }
    }

    private fillParitiesGroup() {
        var positions: Float32Array;
        var lineGeometry: THREE.BufferGeometry;
        var lineMaterial: THREE.LineBasicMaterial;
        var curveObject: THREE.Line;
        var nrOfpartiesNeeded = this.alpha ? this.limit * this.alpha : this.limit;

        while (this.paritiesGroup.children.length <= nrOfpartiesNeeded) {
            positions = new Float32Array(this.pointsPerLine * 3);
            lineGeometry = new THREE.BufferGeometry();
            lineMaterial = new THREE.LineBasicMaterial({ color: COLORS.GREY, linewidth: 2 });
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            curveObject = new THREE.Line(lineGeometry, lineMaterial);
            curveObject.geometry.attributes.position.needsUpdate;
            curveObject.visible = false;
            this.paritiesGroup.add(curveObject);
        }
    }

    private fillGhostGroup() {
        var ctx: CanvasRenderingContext2D;
        var material: THREE.MeshBasicMaterial;
        var obj: THREE.Mesh;
        var geometry = new THREE.SphereGeometry(this.radius);
        var nrOfGhostNeeded = this.s ? Math.ceil(this.limit / this.s) * 2 : 0; 

        while(this.ghostGroup.children.length <= nrOfGhostNeeded) {
            ctx = document.createElement("canvas").getContext("2d")!;
            ctx.canvas.width = 256;
            ctx.canvas.height = 128;
            material = new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(ctx.canvas)
            });
            obj = new THREE.Mesh(geometry, material) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
            obj.userData.ctx = ctx;
            (obj.material as THREE.MeshBasicMaterial).opacity = 0.3;
            (obj.material as THREE.MeshBasicMaterial).transparent = true;
            obj.visible = false;
            this.ghostGroup.add(obj);
        }
    }

    private handleOnClick(e: MouseEvent) {
        if(this.Simulating) return;

        this.rayCaster.setFromCamera({x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1}, this.camera);
        var intersects = this.rayCaster.intersectObjects(this.scene.children);
        if (intersects.length == 0) return;
        let index, strand;
        let obj = intersects[0].object;
        if (obj.parent?.name == "parities") {
            strand = obj.userData.strand;
            index = obj.userData.index;
        } else if (obj.parent?.name == "vertecies") {
            index = obj.userData.index;
        }
        this.renderer.domElement.dispatchEvent( new LatticeClickedEvent(strand, index, {bubbles: true}) );
    }

    public GoTo(position: number) {
        if(!position) return
        this.view.GoTo(position);
    }


    public onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update()
        for (var v of this.verticesGroup.children.filter((v) => v.visible)) {
            v.lookAt(this.camera.position);
        }
        for (var gv of this.ghostGroup.children.filter((gv) => gv.visible)) {
            gv.lookAt(this.camera.position);
        }
        this.view.Animate();
        this.render()
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }
    public GoRight(): void {
        this.view.GoRight();
    }
    public GoLeft(): void {
        this.view.GoLeft();
    }
    public GoUp(): void {
        this.view.GoUp();
    }
    public GoDown(): void {
        this.view.GoDown(); 
    }

    public Update() {
        this.view.Update();
    }
}




