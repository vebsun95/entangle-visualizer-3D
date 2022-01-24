import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BlockEntery } from './interfaces'



export class RendererObject {

    renderer: THREE.Renderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    alpha: number;
    s: number;
    p: number;
    nrOfVertecies: number;
    pointsPerLine: number;

    constructor(alpha: number, s: number, p: number, nrOfV: number, ppp: number) {
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.nrOfVertecies = nrOfV;
        this.pointsPerLine = ppp;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGL1Renderer();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    initObjects(radius: number, parities: BlockEntery[]) {

        const geometry = new THREE.SphereGeometry(radius);

        var obj: THREE.Mesh;
        var material: THREE.MeshBasicMaterial;

        for (let index = 1; index <= this.nrOfVertecies; index++) {
            for (let index = 1; index <= this.nrOfVertecies; index++) {

                material = new THREE.MeshBasicMaterial({
                    map: this.createTexture(index.toString(), radius * 50),
                });
                obj = new THREE.Mesh(geometry, material);
                obj.name = index.toString();

                this.scene.add(obj);
            }
        }

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf0ff0 });

        var name: string;
        var positions: Float32Array;
        var lineGeometry: THREE.BufferGeometry;
        var curveObject: THREE.Line;

        parities.forEach(parity => {

            // Hver linje har 4 punkter, som tar 3 plasser(x, y, z)
            positions = new Float32Array(this.pointsPerLine * 3);

            lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

            curveObject = new THREE.Line(lineGeometry, lineMaterial);
            name = parity.LeftPos + "_" + parity.RightPos;
            curveObject.name = name;
            this.scene.add(curveObject);
            curveObject.geometry.attributes.position.needsUpdate;
        });
    }

    createTwoDimView() {
        const scale = 10;
        const scaleSmall = scale * (Math.sqrt(2) / 2)
        var counter
        const offSetX = (scale + scale * (this.nrOfVertecies / this.s)) / 2;
        const offSetY = (scale + scale * this.s) / 2;
    
        for (let row = 1; row <= this.s; row++) {
            counter = row
            for (let col = 1; col <= (this.nrOfVertecies / this.s); col++) {
                var obj = this.scene.getObjectByName(counter.toString())
                if (typeof obj != undefined) {
                    obj?.position.set(scale * col - offSetX, scale * (this.s - row) - offSetY, 0)
                    obj!.visible = true;
                    obj?.rotateY(col)
                }
                counter += this.s
            }
        }
    
        parities.forEach(parity => {
            let line = scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
            let vertixFrom = scene.getObjectByName(parity.LeftPos.toString());
            let vertixTo = scene.getObjectByName(parity.RightPos.toString());
            if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
                //@ts-ignore
                let array = line.geometry.attributes.position
                switch (parity.Strand) {
                    case horizontal: {
                        if (vertixFrom?.position.x! > vertixTo?.position.x!) {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y, vertixFrom?.position.z)
                        } else {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)
                        }
                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
    
    
                        break;
                    }
                    case LHStrand: {
                        if (vertixFrom?.position.y! < vertixTo?.position.y! && vertixFrom?.position.x! > vertixTo?.position.x!) {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! + scale, vertixFrom?.position.z)
                        }
                        else if (vertixFrom?.position.y! > vertixTo?.position.y!) {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! + scale, vertixFrom?.position.z)
                        } else {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)
                        }
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
    
                        break;
                    }
                    case RHStrand: {
                        if (vertixFrom?.position.x! > vertixTo?.position.x! && vertixFrom?.position.y! > vertixTo?.position.y!) {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! - scale, vertixFrom?.position.z)
                        }
                        else if (vertixFrom?.position.y! < vertixTo?.position.y!) {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! - scale, vertixFrom?.position.z)
                        } else {
                            array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                            array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)
                        }
    
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        break;
                    }
                }
                //@ts-ignore
                line.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    createTexture(text: string, radius: number) {
        let c = document.createElement("canvas");
        c.width = 2 * Math.PI * radius;
        c.height = 2 * radius;
        let step = c.width / 4;
        let ctx = c.getContext("2d");
        ctx!.fillStyle = "#000000";
        ctx!.fillRect(0, 0, 5, c.height);
        ctx!.fillStyle = "#00ff00";
        ctx!.fillRect(0, 0, c.width, c.height);
        ctx!.font = (radius * 0.8) + "px black";
        ctx!.fillStyle = "black";
        ctx!.textBaseline = "middle";
        ctx!.textAlign = "center";
        for (let i = 0; i < 4; i++) {
            ctx!.fillText(text, step * i, (step + (radius * 0.5)) * 0.5);
        }

        return new THREE.CanvasTexture(c);
    }

    onWindowRezise() {
        this.camera.aspect = window.innerWidth / window.innerHeight;;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}