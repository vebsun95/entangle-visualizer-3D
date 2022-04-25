import * as THREE from "three";
import { STRANDS } from "../../SharedKernel/constants";
import { DataContainer } from "../../SharedKernel/dataContainer";
import { Parity, Vertex } from "../../SharedKernel/interfaces";
import { LaticeMovedEvent } from "../events/latticeMovedEvent";
import { View } from "../interfaces/interfaces";
import { MyControls } from "../MyControls";
import { updateLabel } from "../utils/updateLabels";


export class TwoDView extends DataContainer implements View {
    public controls: MyControls;
    public verticesGroup: THREE.Group;
    public paritiesGroup: THREE.Group;
    public ghostGroup: THREE.Group;
    private scale: number;
    private drawFrom: number = 1;
    private lineGeomIndex: number = 0;
    private ghostIndex: number = 0;
    private camera: THREE.Camera;
    public StartCamera: THREE.Vector3 = new THREE.Vector3();

    public constructor(verticesGroup: THREE.Group, paritiesGroup: THREE.Group, ghostGroup: THREE.Group, scale: number, controls: MyControls, camera: THREE.Camera) {
        super();
        this.verticesGroup = verticesGroup;
        this.paritiesGroup = paritiesGroup;
        this.ghostGroup = ghostGroup;
        this.scale = scale;
        this.controls = controls;
        this.camera = camera;
    }

    private set DrawFrom(position: number) {
        this.drawFrom = position - Math.min(this.verticesGroup.children.length, this.nrOfVertices) / 2;
        if (this.drawFrom < 1) {
            this.drawFrom = this.nrOfVertices + this.drawFrom;
        }
        this.drawFrom = Math.ceil(this.drawFrom / this.s) * this.s;
        this.drawFrom++;
        if (this.drawFrom >= this.nrOfVertices) {
            this.drawFrom = 1;
        }
    }

    private get DrawFrom(): number {
        let position = this.drawFrom + Math.min(this.verticesGroup.children.length, this.nrOfVertices) / 2
        if (position > this.nrOfVertices) {
            position = position % this.nrOfVertices;
        }
        else if (position < 1) {
            position = this.nrOfVertices + position;
        }
        return position;
    }

    public GoRight(): void {
        let position = this.DrawFrom + this.s;
        if (position > this.nrOfVertices) position %= this.nrOfVertices;
        dispatchEvent(new LaticeMovedEvent(position, { bubbles: true }));
    }
    public GoLeft(): void {
        let position = this.DrawFrom - this.s - 1
        if (position < 1) position += this.nrOfVertices;
        dispatchEvent(new LaticeMovedEvent(position, { bubbles: true }));
    }
    public GoUp(): void {
        let position = this.DrawFrom + this.s * 10;
        if (position > this.nrOfVertices) position %= this.nrOfVertices;
        dispatchEvent(new LaticeMovedEvent(position, { bubbles: true }));
    }
    public GoDown(): void {
        let position = this.DrawFrom - this.s * 10;
        if (position < 1) position += this.nrOfVertices;
        dispatchEvent(new LaticeMovedEvent(position, { bubbles: true }));
    }
    public Animate(): void {

    }
    public HandleUpdatedData(): void {
        this.Update();
    }

    public GoTo(position: number): void {
        this.DrawFrom = position;
        this.Update();
        var v = this.verticesGroup.getObjectByName(position.toString())!;
        if (v) {
            this.controls.panOffset.set(v.position.x - this.controls.camera.position.x, (((this.s / 2) + 1) * this.scale) - this.controls.camera.position.y, 0);
        }
    }

    public Update(): void {
        this.MoveDataBlocks();
        this.MoveParityBlocks();
    }

    private MoveDataBlocks() {
        var startIndex = this.drawFrom, row = this.s, column = 0;
        var vertex: Vertex;
        var obj: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        for (var i = 0; i < this.verticesGroup.children.length; i++) {
            obj = this.verticesGroup.children[i] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
            vertex = this.vertices.get(startIndex)!;
            obj.position.set(
                this.scale * column, // x coordination
                this.scale * row,    // y coordination
                0                    // z coordination
            );
            updateLabel(startIndex.toString(), obj.userData.ctx, vertex.Color, vertex.Depth > 1);
            obj.material.map!.needsUpdate = true;
            obj.name = startIndex.toString();
            obj.userData.index = vertex.Index;
            startIndex++;
            row--;
            if (row == 0) {
                row = this.s;
                column++;
            }
            if (startIndex > this.nrOfVertices) {
                startIndex = 1;
                row = this.s;
                column += 2;
            }
            // Gone in a loop;
            if (startIndex == this.drawFrom) {
                break;
            }
        }

        for (; i < this.verticesGroup.children.length; i++) {
            obj = this.verticesGroup.children[i] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
            obj.name = "";
            obj.visible = false;
        }
    }

    private MoveParityBlocks() {
        /* --- Flytter på parity blokkene --- */
        var startIndex = this.drawFrom;
        var parityPosition: number, parity: Parity;
        var startNode: THREE.Object3D | undefined, endNode: THREE.Object3D | undefined;
        var startPos: THREE.Vector3, endPos: THREE.Vector3;
        this.lineGeomIndex = 0;
        this.ghostIndex = 0;
        for (let index = 0; index < this.verticesGroup.children.length; index++) {
            for (var [strand, output] of this.parities.entries()) {
                parityPosition = this.parityShift.get(startIndex)!;
                parity = output.get(parityPosition) as Parity;
                if (parity.To == null || parity.From == null) continue;
                startNode = this.verticesGroup.getObjectByName(parity.From.toString());
                endNode = this.verticesGroup.getObjectByName(parity.To.toString());
                if (typeof startNode === "undefined" || typeof endNode === "undefined") continue;
                startPos = startNode.position; 
                endPos = endNode.position;
                if (startPos.x > endPos.x) continue;
                this.paritiesGroup.children[this.lineGeomIndex].userData.strand = strand;
                this.paritiesGroup.children[this.lineGeomIndex].userData.index = parity.Index;
                if (parity.To < parity.From) {
                    // Gjør avansert logikk her
                    this.CreateParitiyAdvanced2D(parity, strand, startNode, endNode);
                }
                else {
                    // Gjør basic logikk her
                    this.CreateParitiyBasic2D(parity, strand, startNode, endNode);
                }

            }
            startIndex++
            if (startIndex > this.nrOfVertices) {
                startIndex = 1;
            }
            if (startIndex == this.drawFrom) {
                break
            }
        }
        for (; this.lineGeomIndex < this.paritiesGroup.children.length; this.lineGeomIndex++) {
            var line = this.paritiesGroup.children[this.lineGeomIndex];
            line.userData.strand = null;
            line.userData.index = null;
            line.name = "";
            line.visible = false;
        }
        for (; this.ghostIndex < this.ghostGroup.children.length; this.ghostIndex++) {
            var ghost = this.ghostGroup.children[this.ghostIndex];
            ghost.name = "";
            ghost.visible = false;
        }
    }
    private CreateParitiyAdvanced2D(output: Parity, strand: number, startNode: THREE.Object3D, endNode: THREE.Object3D) {
        let line = this.paritiesGroup.children[this.lineGeomIndex++] as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
        let nrColumns = Math.floor(this.nrOfVertices / this.s);
        let currentColumn = Math.floor((output.From! - 1) / this.s);
        line.visible = true;
        line.material.color.setHex(output.Color);
        let array = line.geometry.attributes.position;
        let drawRange: number;
        array.setXYZ(0, startNode!.position.x, startNode!.position.y, startNode!.position.z);
        switch (strand) {
            case STRANDS.HStrand: {
                array.setXYZ(1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                drawRange = 2;
                break;
            }
            case STRANDS.RHStrand: {
                // LeftPos and RightPos is on the same row and last column to make an eclipse line instead of straight
                if (output.From! % this.s == output.To! % this.s) {//&& currentColumn == nrColumns) {
                    console.log("RHStrand går til samme")
                    console.log(output.From, output.To, output.Index)
                    // Give rightPos, leftPos and 1 or -1 if it is RHStrand or LH Strand
                    let pointList = this.createEllipseLine(endNode, startNode, 1);
                    for (let i = 0; i < pointList.length; i++) {
                        array.setXYZ(pointList[i][2], pointList[i][0], pointList[i][1], 0);
                    }
                    array.setXYZ(pointList[pointList.length - 1][2] + 1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                    drawRange = pointList[pointList.length - 1][2] + 1;
                }
                else {
                    array.setXYZ(1, startNode!.position.x + (this.scale / 2), startNode!.position.y - (this.scale / 3), startNode!.position.z);
                    array.setXYZ(2, endNode!.position.x - (this.scale / 2), endNode!.position.y + (this.scale / 3), endNode!.position.z);
                    array.setXYZ(3, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                    drawRange = 4;
                }
                break;
            }
            case STRANDS.LHStrand: {
                // If top row and second last column
                if (output.From! % this.s == 1 && currentColumn < nrColumns) {
                    let name = this.vertices.get(output.To!)!.Index.toString();
                    let color = this.vertices.get(output.To!)!.Color;
                    var ghost = this.createGhostVertex(name, startNode!.position.x + this.scale, startNode!.position.y + this.scale, 0, color);
                    array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                    drawRange = 2;
                }
                // LeftPos and RightPos is on the same row and last column to make an eclipse line instead of straight
                else if (output.From! % this.s == output.To! % this.s) {
                    console.log("LHStrand går til samme")
                    // Give rightPos, leftPos and 1 or -1 if it is RHStrand or LH Strand
                    let pointList = this.createEllipseLine(endNode, startNode, -1);
                    for (let i = 0; i < pointList.length; i++) {
                        array.setXYZ(pointList[i][2], pointList[i][0], pointList[i][1], 0);
                    }
                    array.setXYZ(pointList[pointList.length - 1][2] + 1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                    drawRange = pointList[pointList.length - 1][2] + 1;
                }
                else {
                    array.setXYZ(1, startNode!.position.x + (this.scale / 2), startNode!.position.y + (this.scale / 3), startNode!.position.z);
                    array.setXYZ(2, endNode!.position.x - (this.scale / 2), endNode!.position.y - (this.scale / 3), endNode!.position.z);
                    array.setXYZ(3, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                    drawRange = 4;
                }
                break;
            }
            default: {
                // Default case if alpha > 3
                array.setXYZ(1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                drawRange = 2;
                break;
            }
        }
        line!.geometry.setDrawRange(0, drawRange);
        line!.geometry.attributes.position.needsUpdate = true;
        line.geometry.computeBoundingSphere();

    }


    private CreateParitiyBasic2D(output: Parity, strand: number, startNode: THREE.Object3D, endNode: THREE.Object3D) {
        let line = this.paritiesGroup.children[this.lineGeomIndex++] as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
        line.visible = true;
        line.material.color.setHex(output.Color);
        let array = line.geometry.attributes.position;
        array.setXYZ(0, startNode!.position.x, startNode!.position.y, startNode!.position.z);
        switch (strand) {
            case STRANDS.HStrand: {
                array.setXYZ(1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                break
            }
            case STRANDS.RHStrand: {
                if (output.To! % this.s == 1) {
                    let name = this.vertices.get(output.To!)!.Index.toString();
                    let color = this.vertices.get(output.To!)!.Color;
                    var ghost = this.createGhostVertex(name, startNode!.position.x + this.scale, startNode!.position.y - this.scale, 0, color);
                    array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                }
                else {
                    array.setXYZ(1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                }
                break
            }
            case STRANDS.LHStrand: {
                if (output.To! % this.s == 0) {
                    let name = this.vertices.get(output.To!)!.Index.toString();
                    let color = this.vertices.get(output.To!)!.Color;
                    var ghost = this.createGhostVertex(name, startNode!.position.x + this.scale, startNode!.position.y + this.scale, 0, color);
                    array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                }
                else {
                    array.setXYZ(1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
                }
                break
            }
            default: {
                console.log("default", output.Index, output.To)
                // Default case if alpha > 3
                array.setXYZ(1, endNode!.position.x, endNode!.position.y, endNode!.position.z);
            }
        }
        line!.geometry.setDrawRange(0, 2);
        line!.geometry.attributes.position.needsUpdate = true;
        line.geometry.computeBoundingSphere();
    }

    private createGhostVertex(index: string, x: number, y: number, z: number, color: number) {

        var obj = this.ghostGroup.children[this.ghostIndex] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        updateLabel(index, obj.userData.ctx, color, false);
        obj.position.set(x, y, z);
        obj.material.map!.needsUpdate = true;
        obj.visible = true;

        this.ghostIndex++;


        return obj
    }

    private createEllipseLine(rightPos: THREE.Object3D<THREE.Event>, leftPos: THREE.Object3D<THREE.Event>, type: number) {
        let tempList: [number, number, number][] = [];
        let deltaX = (rightPos!.position.x + leftPos!.position.x) / 2;     // https://lexique.netmath.ca/en/half-ellipse-function/#:~:text=Function%20defined%20by%20a%20relation,centered%20on%20the%20origin%20point
        let deltaY = leftPos!.position.y;
        let a = rightPos!.position.x - deltaX;
        let b = this.scale / 3;
        let counter = 1;
        let xPosition = leftPos!.position.x
        for (let i = a - 1; i > 0; i--) {
            xPosition = xPosition + 1;
            let y = deltaY - (type * ((b / a) * Math.sqrt(Math.pow(a, 2) - Math.pow(i, 2))));
            tempList.push([xPosition, y, counter]);
            counter++;
        }
        for (let i = 0; i < a; i++) {
            xPosition = xPosition + 1;
            let y = deltaY - (type * ((b / a) * Math.sqrt(Math.pow(a, 2) - Math.pow(i, 2))));
            tempList.push([xPosition, y, counter]);
            counter++;
        }
        return tempList;
    }
}