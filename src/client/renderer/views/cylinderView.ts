import * as THREE from "three";
import { DataContainer } from "../../SharedKernel/dataContainer";
import { Parity, Vertex } from "../../SharedKernel/interfaces";
import { LaticeMovedEvent } from "../events/latticeMovedEvent";
import { View } from "../interfaces/interfaces";
import { MyControls } from "../MyControls";
import { updateLabel } from "../utils/updateLabels";


export class CylinderView extends DataContainer implements View {
    public controls: MyControls;
    public verticesGroup: THREE.Group;
    public paritiesGroup: THREE.Group;
    public ghostGroup: THREE.Group;
    private scale: number;
    private drawFrom: number = 1;
    public StartCamera: THREE.Vector3 = new THREE.Vector3();

    public constructor(verticesGroup: THREE.Group, paritiesGroup: THREE.Group, ghostGroup: THREE.Group, scale: number, controls: MyControls) {
        super();
        this.verticesGroup = verticesGroup;
        this.paritiesGroup = paritiesGroup;
        this.ghostGroup = ghostGroup;
        this.scale = scale;
        this.controls = controls;

        // No need for ghost vertices here
        for(let gv of this.ghostGroup.children) {
            gv.visible = false;
        }
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
            this.controls.panDirectly(new THREE.Vector3( v.position.x, this.controls.camera.position.y, this.controls.camera.position.z ));
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
        var deltaPi: number = (2 * Math.PI) / this.s;


        for (var i = 0; i < this.verticesGroup.children.length; i++) {
            vertex = this.vertices.get(startIndex)!;
            obj = this.verticesGroup.children[i] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
            obj.position.set(
                this.scale * column,
                2 * this.scale * Math.cos(deltaPi * row),
                2 * this.scale * Math.sin(deltaPi * row)
            )
            updateLabel(startIndex.toString(), obj.userData.ctx, vertex.Color, vertex.Depth > 1);
            obj.material.map!.needsUpdate = true;
            obj.visible = true;
            obj.name = startIndex.toString();
            obj.userData.index = vertex.Index;
            startIndex++;

            row = (row + 1) % this.s;
            if (row == 0) {
                column++;
            }
            if (startIndex > this.nrOfVertices) {
                startIndex = 1;
                column += 2;
                row = 0;
            }
            if (startIndex == this.drawFrom) break;
        }

        for (i++; i < this.verticesGroup.children.length; i++) {
            obj = this.verticesGroup.children[i] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
            obj.name = "";
            obj.visible = false;
        }
    }

    private MoveParityBlocks() {
        let startIndex = this.drawFrom, parity: Parity;
        let line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>, lineIndex: number;
        let array: THREE.BufferAttribute, drawRange: number = 2, parityPosition: number;
        let start: THREE.Object3D, startPos: THREE.Vector3, end: THREE.Object3D, endPos: THREE.Vector3;

        for (lineIndex = 0; lineIndex < this.paritiesGroup.children.length;) {
            for (let [strand, parityMap] of this.parities.entries()) {
                parityPosition = this.parityShift.get(startIndex)!;
                parity = parityMap.get(parityPosition)!;
                if (parity.From == null || parity.To == null) {
                    continue;
                }
                start = this.verticesGroup.getObjectByName(parity.From.toString())!;
                end = this.verticesGroup.getObjectByName(parity.To!.toString())!;
                if (!start || !end) {
                    continue
                }
                startPos = start.position;
                endPos = end.position;
                if (startPos.x > endPos.x) {
                    continue
                }
                line = this.paritiesGroup.children[lineIndex++] as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
                line.visible = true;
                array = line.geometry.attributes.position as THREE.BufferAttribute;
                array.setXYZ(0, startPos.x, startPos.y, startPos.z);
                array.setXYZ(drawRange! - 1, endPos.x, endPos.y, endPos.z);
                line.geometry.setDrawRange(0, drawRange!);
                line.material.color.setHex(parity.Color);
                line.geometry.attributes.position.needsUpdate = true;
                line.material.needsUpdate = true;
                line.geometry.computeBoundingSphere();
            }
            startIndex++;
            if (startIndex > this.nrOfVertices) {
                startIndex = 1;
            }
            if (startIndex == this.drawFrom) break;
        }
        for(; lineIndex < this.paritiesGroup.children.length; lineIndex++) {
            line = this.paritiesGroup.children[lineIndex] as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
            line.visible = false;
            line.name = ""
        }

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
}