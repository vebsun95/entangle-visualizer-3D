import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Parities, Vertices } from './interfaces'
import { DIRECTIONS, STRANDS } from './constants';
import { DataContainer } from './dataContainer';
import { MyControls } from './MyControls';
import { start } from 'repl';
import { throws } from 'assert';



export class RendererObject extends DataContainer {


    renderer: THREE.Renderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: MyControls;
    pointsPerLine: number;
    limit: number = 250;
    drawFrom: number = 0;
    verticesGroup: THREE.Group = new THREE.Group();
    paritiesGroup: THREE.Group = new THREE.Group();
    ghostGroup: THREE.Group = new THREE.Group();
    scale: number = 10;
    radius: number = 2;
    ghostgroupshow: boolean = true;
    paritiesGroupList: THREE.Group[] = [];

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
        this.limit = this.limit + (this.s - (this.limit % this.s));
        console.log(this.limit)
        for (let i = 0; i < this.alpha; i++) {
            this.paritiesGroupList.push(new THREE.Group());
        }
        
    }


    initObjects() {
        const geometry = new THREE.SphereGeometry(this.radius);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf0ff0, linewidth: 2 });

        var obj: THREE.Mesh;
        var material: THREE.MeshBasicMaterial;
        var positions: Float32Array;
        var lineGeometry: THREE.BufferGeometry;
        var curveObject: THREE.Line;

        // Hvis listen av vertcies er mindre enn limit verdien.
        if (this.vertices.length < this.limit) {
            this.limit = this.vertices.length
        }

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
                //this.paritiesGroup.add(curveObject);
                this.paritiesGroupList[i].add(curveObject);
            }
        }

        this.scene.add(this.verticesGroup);
        //this.scene.add(this.paritiesGroup);
        for (let i = 0; i < this.alpha; i++) {
            this.scene.add(this.paritiesGroupList[i]);
        }
    }

    createTwoDimView() {
        this.ghostGroup.clear();
        var column = - ((this.limit / 2) / this.s)
        var startIndex = this.drawFrom;
        var row = 0;
        var starty = (this.s * this.scale) / 2
        var skip = false;
        var increasecolumn = false;
        /* --- Flytter, enderer label og farge på data-blokkene ---*/
        for (var v of this.verticesGroup.children) {
            if (!skip){
                v.position.set(
                    this.scale * column,
                    starty - (this.scale * row),
                    0
                )
                v.name = this.vertices[startIndex].Label;
                //@ts-ignore
                v.material.map = this.createTexture(v.name);
                //@ts-ignore
                v.material.color.setHex(this.vertices[startIndex].Color);
                v.rotateY(0.9)
                startIndex = (startIndex + 1) % this.nrOfVertices;
                v.visible = true;;
            }
            else {
                v.visible = false;
                v.name = "";
            }
            if (startIndex == 0) {
                skip = true;
                if (!increasecolumn) {
                    column++;
                    increasecolumn = true;
                }
            }
            row = (row + 1) % this.s;
            if (row == 0 && startIndex >= 0) {
                column++;
                skip = false;
            }
        }
        
        // Lager ghostVertecies på siste kolonne + 1
        // let endx = 0
        // if (startIndex % this.s == 0) {
        //     endx = this.scale * column;
        // }
        // else {
        //     endx = this.scale * (column + 1)
        // }

        // for (let i = 0; i < this.s; i++) {
        //     let name = this.vertices[startIndex].Label
        //     let color = this.vertices[startIndex].Color
        //     var ghost = this.createGhostVertex(name, endx, starty - (this.scale * (i)), 0, color)
        //     ghost.name = "ghost" + name
        //     startIndex++
        // }
        /* --- Flytter på parity blokkene --- */
        startIndex = this.drawFrom;
        let lineGeomIndex = 0;
        let counter = 0;
        for (let index = 0; index < this.limit; index++) {
            for (var output of this.vertices[startIndex].Outputs) {
                if (index + this.s < this.limit) {
                let line  = this.paritiesGroupList[counter % this.alpha].children[lineGeomIndex] as THREE.Line;
                //let line  = this.paritiesGroup.children[lineGeomIndex] as THREE.Line;
                let leftPos = this.scene.getObjectByName(output.LeftPos.toString());
                let rightPos = this.scene.getObjectByName(output.RightPos.toString());

                if (typeof leftPos != undefined && typeof rightPos != undefined) {
                    let array = line.geometry.attributes.position;
                    array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z);
                    switch (output.Strand) {
                        case STRANDS.HStrand: {
                            if (index + this.s >= this.limit) {
                                //console.log("HSTRAND");
                                //console.log(output.LeftPos, output.RightPos)
                                var temp = this.scene.getObjectByName("ghost" + output.RightPos.toString());
                                if (temp != undefined) {
                                    array.setXYZ(1, temp!.position.x, temp!.position.y, temp!.position.z);
                                }
                            }
                            else {
                                array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                            }
                            break
                        }
                        case STRANDS.LHStrand: {
                            if (output.RightPos % this.s == 0) {
                                console.log("LHSTRAND");
                                console.log(output.LeftPos, output.RightPos)
                                let name = this.vertices[output.RightPos-1].Label;
                                let color = this.vertices[output.RightPos-1].Color;
                                if (output.RightPos <= this.s) {
                                    var ghost = this.createGhostVertex(name, leftPos!.position.x + (this.scale*2), leftPos!.position.y + this.scale, 0, color);
                                }
                                else {
                                    var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y + this.scale, 0, color);
                                }
                                array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                            }
                            else if(index + this.s >= this.limit) {
                                console.log("LHSTRAND");
                                console.log(output.LeftPos, output.RightPos);
                                var temp = this.scene.getObjectByName("ghost" + output.RightPos.toString()); 
                                if (temp != undefined) {
                                    array.setXYZ(1, temp!.position.x, temp!.position.y, temp!.position.z);
                                }
                            }
                            else {
                                array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                            }
                            break
                        }
                        case STRANDS.RHStrand: {
                            if (output.RightPos % this.s == 1) {
                                console.log("RHSTRAND");
                                console.log(output.LeftPos, output.RightPos)
                                let name = this.vertices[output.RightPos-1].Label;
                                let color = this.vertices[output.RightPos-1].Color;
                                if (output.RightPos <= this.s) {
                                    var ghost = this.createGhostVertex(name, leftPos!.position.x + (this.scale*2), leftPos!.position.y - this.scale, 0, color);
                                }
                                else {
                                    var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y - this.scale, 0, color);
                                }   
                                array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                            }
                            else if(index + this.s >= this.limit) {
                                console.log("RHSTRAND");
                                console.log(output.LeftPos, output.RightPos);
                                var temp = this.scene.getObjectByName("ghost" + output.RightPos.toString());
                                if (temp != undefined) {
                                    array.setXYZ(1, temp!.position.x, temp!.position.y, temp!.position.z);
                                }
                            }
                            else {
                                array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                            }
                            break
                        }
                        default:
                            {
                                // Vet ikke nøyaktig hvor linjen skal gå hvis det er alpha > 3.
                                array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                            }
                    }
                    line!.geometry.setDrawRange(0, 2);
                    line!.geometry.attributes.position.needsUpdate = true;
                }
                counter++;
            }
        }
            startIndex = (startIndex + 1) % this.nrOfVertices;
            lineGeomIndex++;
        }
        this.ghostGroup.visible = this.ghostgroupshow;

    }
        

    createGhostVertex(index: string, x: number, y: number, z: number, color: number) {
    
        const geometry = new THREE.SphereGeometry(this.radius);
    
        var obj: THREE.Mesh;
        var material: THREE.MeshBasicMaterial;
        
        // Lager enkel ghost vertex
        material = new THREE.MeshBasicMaterial();
        obj = new THREE.Mesh(geometry, material);
        //@ts-ignore
        obj.material.map = this.createTexture(index);
        //@ts-ignore
        obj.material.color.setHex(color);
        obj.position.x = x
        obj.position.y = y
        obj.position.z = z
        //@ts-ignore
        obj.material.opacity = 0.3
        //@ts-ignore
        obj.material.transparent = true;
        this.ghostGroup.add(obj)
    
        this.scene.add(this.ghostGroup);

        return obj
    }

    show_hide_ghostvertcies() {
        this.ghostgroupshow = !this.ghostgroupshow;
        this.ghostGroup.visible = this.ghostgroupshow;
    }

    createLattice() {

        this.ghostGroup.clear();

        var deltaPi: number = (2 * Math.PI) / this.s;
        var column = - Math.ceil((this.limit / 2) / this.s)
        var row = 0;
        var startIndex = this.drawFrom;

        for (var vertex of this.verticesGroup.children) {
            vertex.position.set(
                this.scale * column,
                this.scale * Math.cos(deltaPi * row),
                this.scale * Math.sin(deltaPi * row)
            );
            vertex.name = this.vertices[startIndex].Label;
            //@ts-ignore
            vertex.material.map = this.createTexture(vertex.name);
            //@ts-ignore
            vertex.material.color.setHex(this.vertices[startIndex].Color);


            startIndex++;
            row = (row + 1) % this.s;
            if (row == 0 && startIndex > this.drawFrom) {
                column++
            }
        }

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
                        switch (output.Strand) {
                            case STRANDS.HStrand:
                                array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z)
                                array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z)

                                // Tegner kun de to første 3d-punktene i listen.
                                //@ts-ignore
                                line.geometry.setDrawRange(0, 2);

                                break;
                            case STRANDS.LHStrand:
                                array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z)
                                array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z)

                                // Tegner kun de to første 3d-punktene i listen.
                                //@ts-ignore
                                line.geometry.setDrawRange(0, 2);

                                break;

                            case STRANDS.RHStrand:
                                array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z)
                                array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z)

                                // Tegner kun de to første 3d-punktene i listen.
                                //@ts-ignore
                                line.geometry.setDrawRange(0, 2);

                                break;
                        }

                        //@ts-ignore
                        line.geometry.attributes.position.needsUpdate = true;
                    }
                }
                else {
                    line.visible = false;
                }
                lineGeomIndex++
            }
            startIndex++;
        }
    }

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
    }

    createTexture(text: string) {
        let c = document.createElement("canvas");
        c.width = Math.pow(2, 8) * this.radius;
        c.height = Math.pow(2, 7) * this.radius;

        let step = c.width / 3
        let ctx = c.getContext("2d");
        ctx!.fillStyle = "white";
        ctx!.fillRect(0, 0, c.width, c.height);
        ctx!.font = this.radius * 3 + "em black";
        ctx!.fillStyle = "black";
        ctx!.textBaseline = "middle";
        ctx!.textAlign = "center"
        ctx!.fillText(text, c.width / 4, step * 0.8);
        return new THREE.CanvasTexture(c);
    }

    GoTo(vertexIndex: number) {
        this.drawFrom = vertexIndex - (this.limit / 2);
        if (this.drawFrom < 0) {
            this.drawFrom = this.nrOfVertices + this.drawFrom;
        }
        this.drawFrom = Math.ceil(this.drawFrom/ this.s) * this.s
        if (this.drawFrom == this.nrOfVertices) {
            this.drawFrom = 0;
        }
        console.log(this.drawFrom);
        this.createTwoDimView();
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
        for(var v of this.verticesGroup.children) {
            v.lookAt( this.camera.position )
        }
        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}