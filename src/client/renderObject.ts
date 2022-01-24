import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BlockEntery } from './interfaces'
import { STRANDS } from './constants';
import { DataContainer } from './dataContainer';



export class RendererObject extends DataContainer{

    renderer: THREE.Renderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    pointsPerLine: number;

    constructor(alpha: number, s: number, p: number, parities: BlockEntery[], vertecies: BlockEntery[], ppp: number) {
        super(alpha, s, p, parities, vertecies);
        this.pointsPerLine = ppp;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.renderer = new THREE.WebGL1Renderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    initObjects(radius: number) {
        const geometry = new THREE.SphereGeometry(radius);

        var obj: THREE.Mesh;
        var material: THREE.MeshBasicMaterial;

        for (let index = 1; index <= this.nrOfVertecies; index++) {
            material = new THREE.MeshBasicMaterial({
                map: this.createTexture(index.toString(), radius * 50),
            });
            obj = new THREE.Mesh(geometry, material);
            obj.name = index.toString();

            this.scene.add(obj);
        }

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf0ff0 });

        var name: string;
        var positions: Float32Array;
        var lineGeometry: THREE.BufferGeometry;
        var curveObject: THREE.Line;

        this.parities.forEach(parity => {


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

        this.parities.forEach(parity => {
            let line = this.scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
            let vertixFrom = this.scene.getObjectByName(parity.LeftPos.toString());
            let vertixTo = this.scene.getObjectByName(parity.RightPos.toString());
            if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
                //@ts-ignore
                let array = line.geometry.attributes.position
                switch (parity.Strand) {
                    case STRANDS.HStrand: {
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
                    case STRANDS.LHStrand: {
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
                    case STRANDS.RHStrand: {
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

    createLattice() {

        var counter: number;
        var piParts: number = (2 * Math.PI) / Math.ceil(this.nrOfVertecies / this.s);
        const scale: number = 10;

        for (let i = 1; i <= this.s; i++) {
            counter = i
            for (let pos = 0; pos < 2 * Math.PI; pos += piParts) {
                var obj = this.scene.getObjectByName(counter.toString())
                if (typeof obj != undefined) {
                    obj?.position.set(
                        scale * Math.cos(pos),
                        scale * Math.sin(pos),
                        scale * i)
                }
                counter += this.s
            }
        }

        this.parities.forEach(parity => {
            let line = this.scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
            let vertixTo = this.scene.getObjectByName(parity.LeftPos.toString());
            let vertixFrom = this.scene.getObjectByName(parity.RightPos.toString());
            if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
                switch (parity.Strand) {
                    case STRANDS.HStrand: {
                        //@ts-ignore
                        let array = line.geometry.attributes.position
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;
                    }
                    case STRANDS.LHStrand: {
                        //@ts-ignore
                        let array = line.geometry.attributes.position
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;

                    }
                    case STRANDS.RHStrand: {
                        //@ts-ignore
                        let array = line.geometry.attributes.position
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;

                    }
                }
            } else { console.log(parity.LeftPos + "_" + parity.RightPos) }
        });
    }

    createTorus() {

        var deltaPi = (2 * Math.PI) / (this.nrOfVertecies / this.s)
        var deltaPi1 = (2 * Math.PI) / this.s
        var counter;
        const R = 3 * 10;
        const r = 2 * 5;

        for (let i = 0, c = 1; i <= 2 * Math.PI; i += deltaPi1, c++) {
            counter = c
            for (let j = 0; j <= 2 * Math.PI; j += deltaPi) {
                var obj = this.scene.getObjectByName(counter.toString())
                if (typeof obj != undefined) {
                    obj?.position.set(
                        ((R + r * Math.cos(j)) * Math.cos(i)),
                        ((R + r * Math.cos(j)) * Math.sin(i)),
                        (r * Math.sin(j))
                    );
                    counter += this.s
                }
                else { console.log(counter) }
            }
        }

        this.parities.forEach(parity => {
            let line = this.scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
            let vertixTo = this.scene.getObjectByName(parity.LeftPos.toString());
            let vertixFrom = this.scene.getObjectByName(parity.RightPos.toString());
            if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
                switch (parity.Strand) {
                    case STRANDS.HStrand: {

                        //@ts-ignore
                        let array = line.geometry.attributes.position
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;
                    }
                    case STRANDS.LHStrand: {
                        //@ts-ignore
                        let array = line.geometry.attributes.position
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;

                    }
                    case STRANDS.RHStrand: {
                        //@ts-ignore
                        let array = line.geometry.attributes.position
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;

                    }
                }
            } else { console.log(parity.LeftPos + "_" + parity.RightPos) }
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
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}