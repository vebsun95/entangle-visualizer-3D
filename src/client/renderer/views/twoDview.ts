import * as THREE from "three";
import { STRANDS } from "../../SharedKernel/constants";
import { DataContainer } from "../../SharedKernel/dataContainer";
import { Parity, Vertex } from "../../SharedKernel/interfaces";
import { View } from "../interfaces/interfaces";
import { updateLabel } from "../utils/updateLabels";


export class TwoDView extends DataContainer implements View {
    private verticesGroup: THREE.Group;
    private paritiesGroup: THREE.Group;
    private ghostGroup: THREE.Group;
    private scale: number;
    private limit: number;
    private drawFrom: number = 1;
    private lineGeomIndex: number = 0;
    private ghostIndex: number = 0;
    private scene: THREE.Scene;
    public StartCamera: THREE.Vector3;

    public constructor(verticesGroup: THREE.Group, paritiesGroup: THREE.Group, ghostGroup: THREE.Group, scale: number, limit: number, scene: THREE.Scene) {
        super();
        this.verticesGroup = verticesGroup;
        this.paritiesGroup = paritiesGroup;
        this.ghostGroup = ghostGroup;
        this.scale = scale;
        this.limit = limit;
        this.scene = scene;
        this.StartCamera = new THREE.Vector3( 
            this.nrOfVertices / this.s * this.scale || 0,
            this.s / 2 * this.scale,
            50,
        );
    }
    public HandleUpdatedData(): void {
        this.StartCamera = new THREE.Vector3( 
            this.nrOfVertices / this.s * this.scale,
            this.s / 2 * this.scale,
            50,
        );
    }
    public GoTo(position: number): void {

    }

    public Update(): void {
        this.MoveDataBlocks();
        this.MoveParityBlocks();
    }

    private MoveDataBlocks() {
        var column = 0
        var startIndex = this.drawFrom;
        var row = 0;
        var starty = (this.s * this.scale) / 2
        var vertex: Vertex;
        var obj: THREE.Object3D<THREE.Event>;

        for (var v of this.verticesGroup.children) {
            v.visible = true;
            v.name = "";
        }
        for (var ghostVertx of this.ghostGroup.children) {
            ghostVertx.visible = false;
        }

        for (var i = 0; i < this.limit; i++) {
            if (i >= this.verticesGroup.children.length) {
                return
            }
            vertex = this.vertices.get(startIndex)!;
            obj = this.verticesGroup.children[i];
            updateLabel(startIndex.toString(), obj.userData.ctx, vertex.Color, false);
            obj.position.set(
                this.scale * column,                // x coordination
                starty - (this.scale * row) + 5,    // y coordination
                0                                   // z coordination
            )
            //@ts-ignore
            obj.material.color.setHex(vertex!.Color);
            //@ts-ignore
            obj.material.map.needsUpdate = true;
            obj.name = startIndex.toString();
            startIndex++;
            if (startIndex > this.nrOfVertices) {
                let remainder = this.s - (this.nrOfVertices % this.s);
                for (let j = 0; j < remainder; j++) {
                    this.verticesGroup.children[this.verticesGroup.children.length - 1 - j].visible = false;
                }
                startIndex = 1;
                column += 3;
                row = -1;
            }

            row = (row + 1) % this.s;
            if (row == 0) {
                column++;
            }
        }
    }

    private MoveParityBlocks() {
        /* --- Flytter på parity blokkene --- */
        var startIndex = this.drawFrom;
        this.lineGeomIndex = 0;
        this.ghostIndex = 0;
        for (let index = 0; index < this.limit; index++) {
            for (var [strand, output] of this.parities.entries()) {
                if (this.lineGeomIndex >= this.paritiesGroup.children.length) {
                    return
                }
                this.paritiesGroup.children[this.lineGeomIndex].visible = false;
                // TODO: Fix når parity har fått lattice index
                let parityPosition = this.parityShift.get(startIndex)!;
                let parity = output.get(parityPosition) as Parity;
                if (index + this.s < this.limit && parity.To != null && parity.From != null) {
                    // Sjekker at RightPos er mindre enn LeftPos og siste kolonne ikke er fylt opp av verticies
                    if (parity.To < parity.From && this.nrOfVertices % this.s != 0) {
                        // Gjør avansert logikk her
                        this.CreateParitiyAdvanced2D(parity, strand);
                    }
                    else {
                        // Gjør basic logikk her
                        this.CreateParitiyBasic2D(parity, strand);
                    }
                }
                this.lineGeomIndex++;
            }
            startIndex++
            if (startIndex > this.nrOfVertices) {
                startIndex = 1;
            }
        }
    }
    private CreateParitiyAdvanced2D(output: Parity, strand: number) {
        let line = this.paritiesGroup.children[this.lineGeomIndex] as THREE.Line;
        let leftPos = this.scene.getObjectByName(output.From!.toString());
        let rightPos = this.scene.getObjectByName(output.To!.toString());
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
                        return
                    }
                    else {
                        array.setXYZ(1, leftPos!.position.x + (this.scale / 2), leftPos!.position.y - (this.scale / 3), leftPos!.position.z);
                        array.setXYZ(2, rightPos!.position.x - (this.scale / 2), rightPos!.position.y + (this.scale / 3), rightPos!.position.z);
                        array.setXYZ(3, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 4);
                        line!.geometry.attributes.position.needsUpdate = true;
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
                        return
                    }
                    else {
                        array.setXYZ(1, leftPos!.position.x + (this.scale / 2), leftPos!.position.y + (this.scale / 3), leftPos!.position.z);
                        array.setXYZ(2, rightPos!.position.x - (this.scale / 2), rightPos!.position.y - (this.scale / 3), rightPos!.position.z);
                        array.setXYZ(3, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 4);
                        line!.geometry.attributes.position.needsUpdate = true;
                        return
                    }
                }
                default: {
                    // Default case if alpha > 3
                    array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                    line!.geometry.setDrawRange(0, 2);
                    line!.geometry.attributes.position.needsUpdate = true;
                    return
                }
            }
        }

    }


    private CreateParitiyBasic2D(output: Parity, strand: number) {
        let line = this.paritiesGroup.children[this.lineGeomIndex] as THREE.Line;
        let leftPos = this.scene.getObjectByName(output.From!.toString());
        let rightPos = this.scene.getObjectByName(output.To!.toString());
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
        }
    }

    private createGhostVertex(index: string, x: number, y: number, z: number, color: number) {

        var obj = this.ghostGroup.children[this.ghostIndex] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        updateLabel(index, obj.userData.ctx, color, false);
        obj.material.color.setHex(color);
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