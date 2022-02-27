import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Parity, Vertex } from './interfaces'
import { DIRECTIONS, STRANDS } from './constants';
import { DataContainer } from './dataContainer';
import { MyControls } from './MyControls';
import { start } from 'repl';
import { throws } from 'assert';



export class RendererObject extends DataContainer {


    renderer: THREE.Renderer = new THREE.WebGL1Renderer();
    scene: THREE.Scene = new THREE.Scene();
    camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);;
    controls: MyControls = new MyControls(this.camera, this.renderer.domElement);;
    pointsPerLine: number = 40;
    limit: number = 250;
    drawFrom: number = 0;
    verticesGroup: THREE.Group = new THREE.Group();
    paritiesGroup: THREE.Group = new THREE.Group();
    ghostGroup: THREE.Group = new THREE.Group();
    scale: number = 10;
    radius: number = 2;
    ghostgroupshow: boolean = true;
    paritiesGroupList: THREE.Group[] = [];

    constructor() {
        super();
        this.camera.position.z = 50;
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)
        this.animate();
    }

    HandleUpdatedData() {
        this.initObjects();
        this.createTwoDimView();
    }

    initObjects() {
        this.verticesGroup.clear();
        this.scene.clear();
        for(var p of this.paritiesGroupList) {
            p.clear();
        }

        const geometry = new THREE.SphereGeometry(this.radius);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xd1d1d1, linewidth: 2 });

        var obj: THREE.Mesh;
        var material: THREE.MeshBasicMaterial;
        var positions: Float32Array;
        var lineGeometry: THREE.BufferGeometry;
        var curveObject: THREE.Line;

        this.limit = 250 + (this.s - (250 % this.s));
        for (let i = 0; i < this.alpha; i++) {
            this.paritiesGroupList.push(new THREE.Group());
        }

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
                this.paritiesGroupList[i].add(curveObject);
            }
        }

        this.scene.add(this.verticesGroup);
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
                    starty - (this.scale * row) + 5,
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
                    // Sjekker at RightPos er mindre enn LeftPos og siste kolonne ikke er fylt opp av verticies
                    if (output.RightPos < output.LeftPos && this.nrOfVertices % this.s != 0) {
                        // Gjør avansert logikk her
                        this.CreateParitiyAdvanced2D(output, counter % this.alpha, lineGeomIndex);
                    }
                    else {
                        // Gjør basic logikk her
                        this.CreateParitiyBasic2D(output, counter % this.alpha, lineGeomIndex);
                    }
                }
                counter++;
            }
            startIndex = (startIndex + 1) % this.nrOfVertices;
            lineGeomIndex++;
        }
        this.ghostGroup.visible = this.ghostgroupshow;
    }

    CreateParitiyAdvanced2D(output: Parity, ParityGroupNumber:  number, lineIndex: number) {
        let line = this.paritiesGroupList[ParityGroupNumber].children[lineIndex] as THREE.Line;
        let leftPos = this.scene.getObjectByName(output.LeftPos.toString());
        let rightPos = this.scene.getObjectByName(output.RightPos.toString());
        let nrColumns = Math.floor(this.nrOfVertices / this.s);
        let currentColumn = Math.floor((output.LeftPos - 1) / this.s);
        if (typeof leftPos != "undefined" && typeof rightPos != "undefined") {
            let array = line.geometry.attributes.position;
            array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z);
            switch (output.Strand) {
                case STRANDS.HStrand: {
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    line!.geometry.setDrawRange(0, 2);
                    line!.geometry.attributes.position.needsUpdate = true;
                    return
                }
                case STRANDS.RHStrand: {
                    // LeftPos and RightPos is on the same row and last column
                    if (output.RightPos % this.s == output.LeftPos % this.s && currentColumn == nrColumns) {
                        console.log("RHStrand går til samme")
                        // Give rightPos, leftPos and 1 or -1 if it is RHStrand or LH Strand
                        let pointList = this.createEclipseLine(rightPos, leftPos, 1);
                        for (let i = 0; i < pointList.length; i++) {
                            array.setXYZ(pointList[i][2], pointList[i][0], pointList[i][1], 0);
                        }
                        array.setXYZ(pointList[pointList.length-1][2] + 1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, pointList[pointList.length-1][2] + 1);
                        line!.geometry.attributes.position.needsUpdate = true;
                        return
                    }
                    // If second last column
                    else if (currentColumn < nrColumns) {
                        array.setXYZ(1, leftPos!.position.x + (this.scale), leftPos!.position.y - (this.scale/3), leftPos!.position.z);
                        array.setXYZ(2, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 3);
                        line!.geometry.attributes.position.needsUpdate = true;
                        return
                    }
                    else {
                        array.setXYZ(1,leftPos!.position.x + (this.scale), leftPos!.position.y - (this.scale/3), leftPos!.position.z );
                        array.setXYZ(2, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 3);
                        line!.geometry.attributes.position.needsUpdate = true;
                        return
                    }

                }
                case STRANDS.LHStrand: {
                    // If top row and second last column
                    if (output.LeftPos % this.s == 1 && currentColumn < nrColumns) {
                        console.log("Skal lage ghost vertex for:", output.LeftPos, output.RightPos);
                        let name = this.vertices[output.RightPos-1].Label;
                        let color = this.vertices[output.RightPos-1].Color;
                        var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y + this.scale, 0, color);
                        array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                        line!.geometry.setDrawRange(0, 2);
                        line!.geometry.attributes.position.needsUpdate = true;
                        return
                    }
                    // LeftPos and RightPos is on the same row and last column
                    else if (output.RightPos % this.s == output.LeftPos % this.s && currentColumn == nrColumns) {
                        console.log("LHStrand går til samme")
                        // Give rightPos, leftPos and 1 or -1 if it is RHStrand or LH Strand
                        let pointList = this.createEclipseLine(rightPos, leftPos, -1);
                        for (let i = 0; i < pointList.length; i++) {
                            array.setXYZ(pointList[i][2], pointList[i][0], pointList[i][1], 0);
                        }
                        array.setXYZ(pointList[pointList.length-1][2] + 1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, pointList[pointList.length-1][2] + 1);
                        line!.geometry.attributes.position.needsUpdate = true;
                        return
                    }
                    else {
                        array.setXYZ(1, leftPos!.position.x + (this.scale), leftPos!.position.y + (this.scale/3), leftPos!.position.z);
                        array.setXYZ(2, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 3);
                        line!.geometry.attributes.position.needsUpdate = true;
                        return
                    }
                }
                default: {
                    // Vet ikke nøyaktig hvor linjen skal gå hvis det er alpha > 3.
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    line!.geometry.setDrawRange(0, 2);
                    line!.geometry.attributes.position.needsUpdate = true;
                    return
                }
            }
        }

    }


    CreateParitiyBasic2D(output: Parity, ParityGroupNumber:  number, lineIndex: number) {
        let line = this.paritiesGroupList[ParityGroupNumber].children[lineIndex] as THREE.Line;
        let leftPos = this.scene.getObjectByName(output.LeftPos.toString());
        let rightPos = this.scene.getObjectByName(output.RightPos.toString());
        if (typeof leftPos != "undefined" && typeof rightPos != "undefined") {
            let array = line.geometry.attributes.position;
            array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z);
            switch (output.Strand) {
                case STRANDS.HStrand: {
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    break
                }
                case STRANDS.RHStrand: {
                    if (output.RightPos % this.s == 1) {
                        let name = this.vertices[output.RightPos-1].Label;
                        let color = this.vertices[output.RightPos-1].Color;
                        var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y - this.scale, 0, color);
                        array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                    }
                    else {
                        array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    }
                    break
                }
                case STRANDS.LHStrand: {
                    if (output.RightPos % this.s == 0) {
                        let name = this.vertices[output.RightPos-1].Label;
                        let color = this.vertices[output.RightPos-1].Color;
                        var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y + this.scale, 0, color);
                        array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                    }
                    else {
                        array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    }
                    break
                }
                default: {
                    console.log("default")
                    // Vet ikke nøyaktig hvor linjen skal gå hvis det er alpha > 3.
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                }
            } 
            line!.geometry.setDrawRange(0, 2);
            line!.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Returns a list with (xPosition, yPosition, counter) in given order.
    createEclipseLine(rightPos: THREE.Object3D<THREE.Event>, leftPos: THREE.Object3D<THREE.Event>, type: number) {
        let tempList: [number, number, number][] = [];
        let deltaX = (rightPos!.position.x + leftPos!.position.x) / 2;
        let deltaY = leftPos!.position.y;
        let a = rightPos!.position.x - deltaX;
        let b = this.scale/3;
        let counter = 1;
        let xPosition = leftPos!.position.x
        //console.log("Start spot:", leftPos!.position.x, leftPos!.position.y);
        //console.log("Slutt spot:", rightPos!.position.x, rightPos!.position.y);
        for (let i = a-1; i > 0; i--) {
            xPosition = xPosition + 1;
            let y = deltaY - (type * ((b/a) * Math.sqrt(Math.pow(a,2) - Math.pow(i, 2))));
            //console.log(xPosition, y, counter);
            tempList.push([xPosition, y, counter]);
            counter++;
        }
        for (let i = 0; i < a; i++) {
            xPosition = xPosition + 1;
            let y = deltaY - (type * ((b/a) * Math.sqrt(Math.pow(a,2) - Math.pow(i, 2))));
            //console.log(xPosition, y, counter);
            tempList.push([xPosition, y, counter]);
            counter++;
        }
        //console.log(counter);
        return tempList;
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
        obj.position.set(x,y,z);
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

    UpdateVertex(vertexIndex: number){
        var vertex = this.scene.getObjectByName((vertexIndex + 1).toString()) as THREE.Mesh< THREE.BufferGeometry, THREE.MeshBasicMaterial>
        if(typeof vertex == "undefined") return
        vertex.material.color.setHex(this.vertices[vertexIndex].Color)
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