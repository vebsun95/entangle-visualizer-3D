import * as THREE from "three";
import { STRANDS } from "../../SharedKernel/constants";
import { DataContainer } from "../../SharedKernel/dataContainer";
import { Parity, Vertex } from "../../SharedKernel/interfaces";
import { View } from "../interfaces/interfaces";
import { MyControls } from "../MyControls";
import { updateLabel } from "../utils/updateLabels";


export class TwoDView extends DataContainer implements View {
    public controls: MyControls;
    private verticesGroup: THREE.Group;
    private paritiesGroup: THREE.Group;
    private ghostGroup: THREE.Group;
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
    public Animate(): void {
        
    }
    public HandleUpdatedData(): void {
        this.Update();
    }

    public GoTo(position: number): void {
        this.drawFrom = position - (this.verticesGroup.children.length / 2);
        if (this.drawFrom < 1) {
            this.drawFrom = this.nrOfVertices + this.drawFrom;
        }
        this.drawFrom = Math.ceil(this.drawFrom / this.s) * this.s
        this.drawFrom++;
        if (this.drawFrom >= this.nrOfVertices) {
            this.drawFrom = 1;
        }
        this.Update();
        var v = this.verticesGroup.getObjectByName(position.toString())!;
        if (v) {
            this.controls.panOffset.set(v.position.x - this.controls.camera.position.x, (((this.s / 2) + 1) * this.scale) - this.controls.camera.position.y, 0);
        }
        this.camera.lookAt(v.position)
    }

    public Update(): void {
        this.MoveDataBlocks();
        this.MoveParityBlocks();
    }

    private MoveDataBlocks() {
        var startIndex = this.drawFrom, row = this.s, column = 0;
        var vertex: Vertex;
        var obj: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;

        for(var i=0; i<this.verticesGroup.children.length; i++) {
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

        for(; i<this.verticesGroup.children.length; i++) {
            obj = this.verticesGroup.children[i] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
            obj.name = "";
            obj.visible = false;
        }
    }

    private MoveParityBlocks() {
        /* --- Flytter på parity blokkene --- */
        var startIndex = this.drawFrom;
        this.lineGeomIndex = 0;
        this.ghostIndex = 0;
        for (let index = 0; index < this.verticesGroup.children.length; index++) {
            for (var [strand, output] of this.parities.entries()) {
                let parityPosition = this.parityShift.get(startIndex)!;
                let parity = output.get(parityPosition) as Parity;
                if (index + this.s < this.verticesGroup.children.length && parity.To != null && parity.From != null) {
                    // Sjekker at RightPos er mindre enn LeftPos og siste kolonne ikke er fylt opp av verticies
                    if (parity.To < parity.From && this.nrOfVertices % this.s != 0) {
                        // Gjør avansert logikk her
                        this.CreateParitiyAdvanced2D(parity, strand);
                    }
                    else {
                        // Gjør basic logikk her
                        this.CreateParitiyBasic2D(parity, strand);
                    }
                    this.lineGeomIndex++;
                }
            }
            startIndex++
            if (startIndex > this.nrOfVertices) {
                startIndex = 1;
            }
        }
        for(; this.lineGeomIndex < this.paritiesGroup.children.length; this.lineGeomIndex++) {
            var line = this.paritiesGroup.children[this.lineGeomIndex];
            line.name = "";
            line.visible = false;
        }
        for(; this.ghostIndex < this.ghostGroup.children.length; this.ghostIndex++) {
            var ghost = this.ghostGroup.children[this.ghostIndex];
            ghost.name = "";
            ghost.visible = false;
        }
    }
    private CreateParitiyAdvanced2D(output: Parity, strand: number) {
        let line = this.paritiesGroup.children[this.lineGeomIndex] as THREE.Line;
        let leftPos = this.verticesGroup.getObjectByName(output.From!.toString());
        let rightPos = this.verticesGroup.getObjectByName(output.To!.toString());
        let nrColumns = Math.floor(this.nrOfVertices / this.s);
        let currentColumn = Math.floor((output.From! - 1) / this.s);
        if (typeof leftPos != "undefined" && typeof rightPos != "undefined") {
            line.visible = true;
            //@ts-ignore
            line.material.color.setHex(output.Color);
            let array = line.geometry.attributes.position;
            array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z);
            switch (strand) {
                case STRANDS.HStrand: {
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    line!.geometry.setDrawRange(0, 2);
                    line!.geometry.attributes.position.needsUpdate = true;
                    line.geometry.computeBoundingSphere();
                    return
                }
                case STRANDS.RHStrand: {
                    // LeftPos and RightPos is on the same row and last column to make an eclipse line instead of straight
                    if (output.Index % this.s == output.To! % this.s && currentColumn == nrColumns) {
                        console.log("RHStrand går til samme")
                        // Give rightPos, leftPos and 1 or -1 if it is RHStrand or LH Strand
                        let pointList = this.createEllipseLine(rightPos, leftPos, 1);
                        for (let i = 0; i < pointList.length; i++) {
                            array.setXYZ(pointList[i][2], pointList[i][0], pointList[i][1], 0);
                        }
                        array.setXYZ(pointList[pointList.length - 1][2] + 1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, pointList[pointList.length - 1][2] + 1);
                        line!.geometry.attributes.position.needsUpdate = true;
                        line.geometry.computeBoundingSphere();
                        return
                    }
                    else {
                        array.setXYZ(1, leftPos!.position.x + (this.scale / 2), leftPos!.position.y - (this.scale / 3), leftPos!.position.z);
                        array.setXYZ(2, rightPos!.position.x - (this.scale / 2), rightPos!.position.y + (this.scale / 3), rightPos!.position.z);
                        array.setXYZ(3, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 4);
                        line!.geometry.attributes.position.needsUpdate = true;
                        line.geometry.computeBoundingSphere();
                        return
                    }

                }
                case STRANDS.LHStrand: {
                    // If top row and second last column
                    if (output.Index % this.s == 1 && currentColumn < nrColumns) {
                        console.log("Skal lage ghost vertex for:", output.Index, output.To);
                        let name = this.vertices.get(output.To!)!.Index.toString();
                        let color = this.vertices.get(output.To!)!.Color;
                        var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y + this.scale, 0, color);
                        array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                        line!.geometry.setDrawRange(0, 2);
                        line!.geometry.attributes.position.needsUpdate = true;
                        line.geometry.computeBoundingSphere();
                        return
                    }
                    // LeftPos and RightPos is on the same row and last column to make an eclipse line instead of straight
                    else if (output.Index % this.s == output.To! % this.s && currentColumn == nrColumns) {
                        console.log("LHStrand går til samme")
                        // Give rightPos, leftPos and 1 or -1 if it is RHStrand or LH Strand
                        let pointList = this.createEllipseLine(rightPos, leftPos, -1);
                        for (let i = 0; i < pointList.length; i++) {
                            array.setXYZ(pointList[i][2], pointList[i][0], pointList[i][1], 0);
                        }
                        array.setXYZ(pointList[pointList.length - 1][2] + 1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, pointList[pointList.length - 1][2] + 1);
                        line!.geometry.attributes.position.needsUpdate = true;
                        line.geometry.computeBoundingSphere();
                        return
                    }
                    else {
                        array.setXYZ(1, leftPos!.position.x + (this.scale / 2), leftPos!.position.y + (this.scale / 3), leftPos!.position.z);
                        array.setXYZ(2, rightPos!.position.x - (this.scale / 2), rightPos!.position.y - (this.scale / 3), rightPos!.position.z);
                        array.setXYZ(3, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 4);
                        line!.geometry.attributes.position.needsUpdate = true;
                        line.geometry.computeBoundingSphere();
                        return
                    }
                }
                default: {
                    // Default case if alpha > 3
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    line!.geometry.setDrawRange(0, 2);
                    line!.geometry.attributes.position.needsUpdate = true;
                    line.geometry.computeBoundingSphere();
                    return
                }
            }
        }

    }


    private CreateParitiyBasic2D(output: Parity, strand: number) {
        let line = this.paritiesGroup.children[this.lineGeomIndex] as THREE.Line;
        let leftPos = this.verticesGroup.getObjectByName(output.From!.toString());
        let rightPos = this.verticesGroup.getObjectByName(output.To!.toString());
        if (typeof leftPos != "undefined" && typeof rightPos != "undefined") {
            line.visible = true;
            //@ts-ignore
            line.material.color.setHex(output.Color);
            let array = line.geometry.attributes.position;
            array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z);
            switch (strand) {
                case STRANDS.HStrand: {
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    break
                }
                case STRANDS.RHStrand: {
                    if (output.To! % this.s == 1) {
                        let name = this.vertices.get(output.To!)!.Index.toString();
                        let color = this.vertices.get(output.To!)!.Color;
                        var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y - this.scale, 0, color);
                        array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                    }
                    else {
                        array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    }
                    break
                }
                case STRANDS.LHStrand: {
                    if (output.To! % this.s == 0) {
                        let name = this.vertices.get(output.To!)!.Index.toString();
                        let color = this.vertices.get(output.To!)!.Color;
                        var ghost = this.createGhostVertex(name, leftPos!.position.x + this.scale, leftPos!.position.y + this.scale, 0, color);
                        array.setXYZ(1, ghost!.position.x, ghost!.position.y, ghost!.position.z);
                    }
                    else {
                        array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    }
                    break
                }
                default: {
                    console.log("default", output.Index, output.To)
                    // Default case if alpha > 3
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                }
            }
            line!.geometry.setDrawRange(0, 2);
            line!.geometry.attributes.position.needsUpdate = true;
            line.geometry.computeBoundingSphere();
        }
    }

    private createGhostVertex(index: string, x: number, y: number, z: number, color: number) {

        var obj = this.ghostGroup.children[this.ghostIndex] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        updateLabel(index, obj.userData.ctx, color, false);
        obj.position.set(x, y, z);
        obj.material.opacity = 0.3
        obj.material.transparent = true;
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