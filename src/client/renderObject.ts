import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Parities, Vertices } from './interfaces'
import { DIRECTIONS, STRANDS } from './constants';
import { DataContainer } from './dataContainer';
import { MyControls } from './MyControls';



export class RendererObject extends DataContainer {

    renderer: THREE.Renderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: MyControls;
    pointsPerLine: number;
    limit: number = 500;
    drawFrom: number = 300;
    verticesGroup: THREE.Group = new THREE.Group();
    paritiesGroup: THREE.Group = new THREE.Group();
    scale: number = 10;

    constructor(alpha: number, s: number, p: number, vertices: Vertices[], ppp: number) {
        super(alpha, s, p, vertices);
        this.pointsPerLine = ppp;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;
        this.renderer = new THREE.WebGL1Renderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)
        this.renderer.domElement.setAttribute("tabindex", "1");
        this.controls = new MyControls(this.camera, this.renderer.domElement);
    }


    initObjects(radius: number) {
        const geometry = new THREE.SphereGeometry(radius);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf0ff0, linewidth: 2 });

        var obj: THREE.Mesh;
        var material: THREE.MeshBasicMaterial;
        var positions: Float32Array;
        var lineGeometry: THREE.BufferGeometry;
        var curveObject: THREE.Line;

        for (var index = 0; index < this.limit; index++) {
            material = new THREE.MeshBasicMaterial({
                color: this.vertices[index].Color,
            });
            obj = new THREE.Mesh(geometry, material);
            this.verticesGroup.add(obj);

            for (let i = 0; i < this.alpha; i++) {
                // Hver linje har 4 punkter, som tar 3 plasser(x, y, z)
                positions = new Float32Array(this.pointsPerLine * 3);

                lineGeometry = new THREE.BufferGeometry();
                lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

                curveObject = new THREE.Line(lineGeometry, lineMaterial);
                curveObject.geometry.attributes.position.needsUpdate;
                this.paritiesGroup.add(curveObject);
            }
        }

        this.scene.add(this.verticesGroup);
        this.scene.add(this.paritiesGroup);



        // const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf0ff0 });

        // var name: string;
        // var positions: Float32Array;
        // var lineGeometry: THREE.BufferGeometry;
        // var curveObject: THREE.Line;

        // this.parities.forEach(parity => {
        //     // Hver linje har 4 punkter, som tar 3 plasser(x, y, z)
        //     positions = new Float32Array(this.pointsPerLine * 3);

        //     lineGeometry = new THREE.BufferGeometry();
        //     lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        //     curveObject = new THREE.Line(lineGeometry, lineMaterial);
        //     name = parity.LeftPos + "_" + parity.RightPos;
        //     curveObject.name = name;
        //     this.scene.add(curveObject);
        //     curveObject.geometry.attributes.position.needsUpdate;
        // });
    }

    createTwoDimView() {
        var column = - ((this.limit / 2) / this.s)
        var startIndex = this.drawFrom;
        var row = 0;
        /* --- Flytter, enderer label og farge på data-blokkene ---*/
        for (var v of this.verticesGroup.children) {
            v.position.set(
                this.scale * column,
                this.scale * row,
                0
            )
            v.name = this.vertices[startIndex].Label;
            //@ts-ignore
            v.material.map = this.createTexture(v.name, 50);
            //@ts-ignore
            v.material.color.setHex(this.vertices[startIndex].Color);

            startIndex++;
            row = (row + 1) % this.s;
            if (row == 0 && startIndex > 0) {
                column++;
            }

        }
        /* --- Flytter på parity blokkene --- */
        startIndex = this.drawFrom;
        for (let lineGeomIndex = 0; lineGeomIndex < this.paritiesGroup.children.length;) {

            for (var output of this.vertices[startIndex].Outputs) {
                let line = this.paritiesGroup.children[lineGeomIndex] as THREE.Line;
                // if not er data-blokkene utenfor scenen.
                if (output.LeftPos < this.drawFrom + this.limit && output.RightPos < this.drawFrom + this.limit) {
                    let leftPos = this.scene.getObjectByName(output.LeftPos.toString());
                    let rightPos = this.scene.getObjectByName(output.RightPos.toString());

                    if (typeof leftPos != undefined && typeof rightPos != undefined) {
                        //@ts-ignore
                        let array = line.geometry.attributes.position
                        array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z)
                        array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z)

                        // Tegner kun de to første 3d-punktene i listen.
                        //@ts-ignore
                        line.geometry.setDrawRange(0, 2);
                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;
                    }
                }
                lineGeomIndex++
            }
            startIndex++;
        }
    }

    createLattice() {

        var counter: number;
        var piParts: number = (2 * Math.PI) / Math.ceil(this.nrOfVertices / this.s);
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
                    //@ts-ignore
                    obj.material.color.setHex(0xff0000);
                }
                counter += this.s
            }
        }

        // this.parities.forEach(parity => {
        //     let line = this.scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
        //     let vertixTo = this.scene.getObjectByName(parity.LeftPos.toString());
        //     let vertixFrom = this.scene.getObjectByName(parity.RightPos.toString());
        //     if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
        //         switch (parity.Strand) {
        //             case STRANDS.HStrand: {
        //                 //@ts-ignore
        //                 let array = line.geometry.attributes.position
        //                 array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
        //                 array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

        //                 // Tegner kun de to første 3d-punktene i listen.
        //                 //@ts-ignore
        //                 line.geometry.setDrawRange(0, 2);
        //                 //@ts-ignore
        //                 line.geometry.attributes.position.needsUpdate = true;
        //             }
        //             case STRANDS.LHStrand: {
        //                 //@ts-ignore
        //                 let array = line.geometry.attributes.position
        //                 array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
        //                 array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

        //                 // Tegner kun de to første 3d-punktene i listen.
        //                 //@ts-ignore
        //                 line.geometry.setDrawRange(0, 2);
        //                 //@ts-ignore
        //                 line.geometry.attributes.position.needsUpdate = true;

        //             }
        //             case STRANDS.RHStrand: {
        //                 //@ts-ignore
        //                 let array = line.geometry.attributes.position
        //                 array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
        //                 array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

        //                 // Tegner kun de to første 3d-punktene i listen.
        //                 //@ts-ignore
        //                 line.geometry.setDrawRange(0, 2);
        //                 //@ts-ignore
        //                 line.geometry.attributes.position.needsUpdate = true;

        //             }
        //         }
        //     } else { console.log(parity.LeftPos + "_" + parity.RightPos) }
        // });
    }

    // moveGroups(direction: DIRECTIONS) {
    //     console.log(this.firstColumn, this.lastcolumn)
    //     if (direction === DIRECTIONS.LEFT) {
    //         // let lastColumnGroup = this.columnGroups[this.lastcolumn];
    //         // let firstColumnGroup = this.columnGroups[this.firstColumn];
    //         // if (typeof lastColumnGroup != undefined || typeof firstColumnGroup != undefined) {
    //         //     lastColumnGroup.position.set(firstColumnGroup.position.x + this.scale, firstColumnGroup.position.y, firstColumnGroup.position.z);
    //         //     this.firstColumn--;
    //         //     this.lastcolumn--;
    //         // }
    //     } else if (direction === DIRECTIONS.RIGHT) {
    //         let lastColumnGroup = this.columnGroups[this.lastcolumn];
    //         let firstColumnGroup = this.columnGroups[this.firstColumn];
    //         if (typeof lastColumnGroup != undefined && typeof firstColumnGroup != undefined) {
    //             firstColumnGroup.position.set(lastColumnGroup.position.x + this.scale, lastColumnGroup.position.y, lastColumnGroup.position.z);
    //             this.lastcolumn = this.firstColumn;
    //             this.firstColumn++;
    //         } else {console.log("undefined")}
    //     }
    // }

    createTorus() {

        var deltaPi = (2 * Math.PI) / (this.nrOfVertices / this.s)
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

        // this.parities.forEach(parity => {
        //     let line = this.scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
        //     let vertixTo = this.scene.getObjectByName(parity.LeftPos.toString());
        //     let vertixFrom = this.scene.getObjectByName(parity.RightPos.toString());
        //     if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
        //         switch (parity.Strand) {
        //             case STRANDS.HStrand: {

        //                 //@ts-ignore
        //                 let array = line.geometry.attributes.position
        //                 array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
        //                 array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

        //                 // Tegner kun de to første 3d-punktene i listen.
        //                 //@ts-ignore
        //                 line.geometry.setDrawRange(0, 2);
        //                 //@ts-ignore
        //                 line.geometry.attributes.position.needsUpdate = true;
        //             }
        //             case STRANDS.LHStrand: {
        //                 //@ts-ignore
        //                 let array = line.geometry.attributes.position
        //                 array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
        //                 array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

        //                 // Tegner kun de to første 3d-punktene i listen.
        //                 //@ts-ignore
        //                 line.geometry.setDrawRange(0, 2);
        //                 //@ts-ignore
        //                 line.geometry.attributes.position.needsUpdate = true;

        //             }
        //             case STRANDS.RHStrand: {
        //                 //@ts-ignore
        //                 let array = line.geometry.attributes.position
        //                 array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
        //                 array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

        //                 // Tegner kun de to første 3d-punktene i listen.
        //                 //@ts-ignore
        //                 line.geometry.setDrawRange(0, 2);
        //                 //@ts-ignore
        //                 line.geometry.attributes.position.needsUpdate = true;

        //             }
        //         }
        //     } else { console.log(parity.LeftPos + "_" + parity.RightPos) }
        // });
    }

    createTexture(text: string, radius: number) {
        let c = document.createElement("canvas");
        c.width = 2 * Math.PI * radius;
        c.height = 2 * radius;
        let step = c.width / 3
        let ctx = c.getContext("2d");
        ctx!.fillStyle = "white";
        ctx!.fillRect(0, 0, c.width, c.height);
        ctx!.font = "4em black";
        ctx!.fillStyle = "black";
        ctx!.textBaseline = "middle";
        for (let i = 0; i < 3; i++) {
            ctx!.fillText(text, step * i, step * 0.5);
        }

        return new THREE.CanvasTexture(c);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update()
        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}