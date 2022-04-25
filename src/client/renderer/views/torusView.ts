import * as THREE from "three";
import { DataContainer } from "../../SharedKernel/dataContainer";
import { Parity, Vertex } from "../../SharedKernel/interfaces";
import { View } from "../interfaces/interfaces";
import { MyControls } from "../MyControls";
import { updateLabel } from "../utils/updateLabels";


export class TorusView extends DataContainer implements View {
    public controls: MyControls;
    public verticesGroup: THREE.Group;
    public paritiesGroup: THREE.Group;
    public ghostGroup: THREE.Group;
    private scale: number;
    private drawFrom: number = 1;
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

        // No need for ghost vertices here
        for (let gv of this.ghostGroup.children) {
            gv.visible = false;
        }
    }
    GoRight(): void {
        throw new Error("Method not implemented.");
    }
    GoLeft(): void {
        throw new Error("Method not implemented.");
    }
    GoUp(): void {
        throw new Error("Method not implemented.");
    }
    GoDown(): void {
        throw new Error("Method not implemented.");
    }
    public Animate(): void {

    }
    public HandleUpdatedData(): void {
        this.Update();
    }

    public GoTo(position: number): void {
        let obj = this.verticesGroup.getObjectByName(position.toString()!);
        if(!obj) return;
        this.camera.position.set(obj.position.x + this.scale * 2, obj.position.y + this.scale * 2, obj.position.z + this.scale * 2);
        this.controls.panOffset.set(obj.position.x - this.controls.camera.position.x, obj.position.y - this.controls.camera.position.y, obj.position.z - this.controls.camera.position.z);
        this.camera.lookAt(obj.position)
    }

    public Update(): void {
        this.MoveDataBlocks();
        this.MoveParityBlocks();
    }

    private MoveDataBlocks() {
        var vertex: Vertex;
        var obj: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        var nrPerRings = this.nrOfVertices / this.s;
        var deltaPi = (2 * Math.PI) / nrPerRings
        var deltaPi1 = (2 * Math.PI) / this.s
        var counter, objCounter = 0;
        const R = 3 * this.scale * this.s;
        const r = (this.scale / 4) * nrPerRings;

        for (let i = 0, c = 1; i < 2 * Math.PI; i += deltaPi1, c++) {
            counter = c
            for (let j = 0; j < 2 * Math.PI; j += deltaPi) {
                if (counter > this.vertices.size) {
                    continue
                }
                vertex = this.vertices.get(counter)!;
                obj = this.verticesGroup.children[objCounter++] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
                obj.position.set(
                    ((R + r * Math.cos(j)) * Math.cos(i)),
                    ((R + r * Math.cos(j)) * Math.sin(i)),
                    (r * Math.sin(j))
                );
                updateLabel(counter.toString(), obj.userData.ctx, vertex.Color, vertex.Depth > 1);
                obj.material.map!.needsUpdate = true;
                obj.name = counter.toString();
                obj.visible = true;
                counter += this.s
            }
        }
    }

    private MoveParityBlocks() {
        let startIndex = this.drawFrom, parity: Parity;
        let line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>, lineIndex: number = 0;
        let array: THREE.BufferAttribute, drawRange: number = 2, parityPosition: number;
        let start: THREE.Object3D, startPos: THREE.Vector3, end: THREE.Object3D, endPos: THREE.Vector3;

        for (let i = 0; i < this.verticesGroup.children.length; i++) {
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
                line = this.paritiesGroup.children[lineIndex++] as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
                line.visible = true;
                array = line.geometry.attributes.position as THREE.BufferAttribute;
                array.setXYZ(0, startPos.x, startPos.y, startPos.z);
                array.setXYZ(drawRange - 1, endPos.x, endPos.y, endPos.z);
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
        for (; lineIndex < this.paritiesGroup.children.length; lineIndex++) {
            line = this.paritiesGroup.children[lineIndex] as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
            line.visible = false;
            line.name = ""
        }

    }
}