import * as THREE from "three";
import { BufferAttribute } from "three";
import { DataContainer } from "../../SharedKernel/dataContainer";
import { View } from "../interfaces/interfaces";
import { MyControls } from "../MyControls";
import { updateLabel } from "../utils/updateLabels";


export class noDataView extends DataContainer implements View {
    public controls: MyControls;
    private verticesGroup: THREE.Group;
    private paritiesGroup: THREE.Group;
    private ghostGroup: THREE.Group;
    private scale: number;
    private limit: number;
    public StartCamera: THREE.Vector3 = new THREE.Vector3();

    public constructor(verticesGroup: THREE.Group, paritiesGroup: THREE.Group, ghostGroup: THREE.Group, scale: number, limit: number, controls: MyControls) {
        super();
        this.verticesGroup = verticesGroup;
        this.paritiesGroup = paritiesGroup;
        this.ghostGroup = ghostGroup;
        this.scale = scale;
        this.limit = limit;
        this.controls = controls;
        this.Update();
    }
    public Animate(): void {
        this.verticesGroup.rotateX(0.001);
        this.paritiesGroup.rotateX(0.001);
    }

    public HandleUpdatedData(): void {
        return;
    }

    public GoTo(position: number): void {
        return;
    }

    public Update(): void {
        this.placeDataBlocks();
        this.placeParityBlocks();
    }

    private placeDataBlocks() {
        var data: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
        var x, y, z;
        for (var i = 0; i < this.verticesGroup.children.length; i++) {
            x = this.getRandomInt(-50, 50);
            y = this.getRandomInt(-50, 50);
            z = this.getRandomInt(-50, 50);
            data = this.verticesGroup.children[i] as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
            data.visible = true;
            data.name = i.toString();
            updateLabel("", data.userData.ctx, this.getRandomInt(0, 0xffffff), false);
            data.position.set(x, y, z);
        }
    }

    private placeParityBlocks() {
        var fromIndex: number;
        var toIndex: number;
        var fromPosition: THREE.Vector3;
        var toPosition: THREE.Vector3;
        var line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
        var array: THREE.BufferAttribute;
        for (var i = 0; i < this.verticesGroup.children.length; i++) {
            fromIndex = this.getRandomInt(0, this.verticesGroup.children.length - 1);
            toIndex = this.getRandomInt(0, this.verticesGroup.children.length - 1);
            fromPosition = this.verticesGroup.children[fromIndex].position;
            toPosition = this.verticesGroup.children[toIndex].position;
            line = this.paritiesGroup.children[i] as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
            line.visible = true;
            line.name = fromIndex + "_" + toIndex;
            array = line.geometry.attributes.position as BufferAttribute;
            array.setXYZ(0, fromPosition.x, fromPosition.y, fromPosition.z);
            array.setXYZ(1, toPosition.x, toPosition.y, toPosition.z);
            line.geometry.setDrawRange(0, 2);
            line.geometry.attributes.position.needsUpdate = true;
            line.material.color.setHex(this.getRandomInt(0, 0xffffff));
        }
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}