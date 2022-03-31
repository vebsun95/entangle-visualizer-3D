import * as THREE from 'three';
import { Parity, Vertex } from '../SharedKernel/interfaces'
import { COLORS, STRANDS } from '../SharedKernel/constants';
import { DataContainer } from '../SharedKernel/dataContainer';
import { MyControls } from './MyControls';
import { convertHexToStringColor } from '../SharedKernel/utils';
import { TwoDView } from './views/twoDview';
import { View } from './interfaces/interfaces';
import { noDataView } from './views/noDataView';
import { updateLabel } from './utils/updateLabels';





export class RendererObject extends DataContainer {
    private renderer: THREE.Renderer = new THREE.WebGL1Renderer();
    private scene: THREE.Scene = new THREE.Scene();
    private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);;
    private controls: MyControls = new MyControls(this.camera, this.renderer.domElement);;
    private pointsPerLine: number = 40;
    private limit: number = 259;
    private drawFrom: number = 1;
    private verticesGroup: THREE.Group = new THREE.Group();
    private paritiesGroup: THREE.Group = new THREE.Group();
    private ghostGroup: THREE.Group = new THREE.Group();
    private rayCaster: THREE.Raycaster = new THREE.Raycaster();
    public  Simulating: boolean = true;
    private scale: number = 10;
    private radius: number = 2;
    private ghostgroupshow: boolean = true;
    private lineGeomIndex = 0;
    private ghostIndex = 0;
    private view: View;

    public set View(newView: number) {
        
        if(newView === 0) {
            this.view = new noDataView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls);
        }
        else if(newView === 1) {
            this.view = new TwoDView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls, this.camera);
        }
        else {
            this.view = new noDataView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls);
        }
        this.Update();
    }

    constructor() {
        super();
        this.camera.position.z = 50;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.onclick = this.handleOnClick.bind(this);
        this.verticesGroup.name = "vertecies";
        this.scene.add(this.verticesGroup);
        this.paritiesGroup.name = "parities";
        this.scene.add(this.paritiesGroup);
        this.scene.add(this.ghostGroup);
        this.initObjects();
        this.view = new noDataView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls);

        const axesHelper = new THREE.AxesHelper( 5 );
        this.scene.add( axesHelper );
        this.animate();

    }

    public HandleUpdatedData() {
        this.initObjects();
        this.view = new TwoDView(this.verticesGroup, this.paritiesGroup, this.ghostGroup, this.scale, this.controls, this.camera);
        this.view.UpdateData(this.alpha, this.s, this.p, this.vertices, this.parities, this.parityShift);
        this.view.HandleUpdatedData();
    }

    private initObjects() {
        // this.limit = this.limit + (this.s - (this.limit % this.s));
        // this.drawFrom = 1;

        // Hvis listen av vertcies er mindre enn limit verdien.
        // if (this.vertices.size < this.limit) {
        //     this.limit = this.vertices.size
        // }

        // Lager n-antall verticies + parity
        this.fillVerteciesGroup();
        this.fillParitiesGroup();
        this.fillGhostGroup();
    }

    private fillVerteciesGroup() {
        var ctx: CanvasRenderingContext2D;
        var material: THREE.MeshBasicMaterial;
        var obj: THREE.Mesh;
        var geometry = new THREE.SphereGeometry(this.radius);
        while (this.verticesGroup.children.length <= this.limit) {
            ctx = document.createElement("canvas").getContext("2d")!;
            ctx.canvas.width = 256;
            ctx.canvas.height = 128;
            material = new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(ctx.canvas)
            });
            obj = new THREE.Mesh(geometry, material);
            obj.userData.ctx = ctx;
            obj.visible = false;
            this.verticesGroup.add(obj);
        }
    }

    private fillParitiesGroup() {
        var positions: Float32Array;
        var lineGeometry: THREE.BufferGeometry;
        var lineMaterial: THREE.LineBasicMaterial;
        var curveObject: THREE.Line;
        var nrOfpartiesNeeded = this.alpha ? this.limit * this.alpha : this.limit;

        while (this.paritiesGroup.children.length <= nrOfpartiesNeeded) {
            positions = new Float32Array(this.pointsPerLine * 3);
            lineGeometry = new THREE.BufferGeometry();
            lineMaterial = new THREE.LineBasicMaterial({ color: COLORS.GREY, linewidth: 2 });
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            curveObject = new THREE.Line(lineGeometry, lineMaterial);
            curveObject.geometry.attributes.position.needsUpdate;
            curveObject.visible = false;
            this.paritiesGroup.add(curveObject);
        }
    }

    private fillGhostGroup() {
        var ctx: CanvasRenderingContext2D;
        var material: THREE.MeshBasicMaterial;
        var obj: THREE.Mesh;
        var geometry = new THREE.SphereGeometry(this.radius);
        var nrOfGhostNeeded = this.s ? Math.ceil(this.limit / this.s) * 2 : 0; 

        while(this.ghostGroup.children.length <= nrOfGhostNeeded) {
            ctx = document.createElement("canvas").getContext("2d")!;
            ctx.canvas.width = 256;
            ctx.canvas.height = 128;
            material = new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(ctx.canvas)
            });
            obj = new THREE.Mesh(geometry, material);
            obj.userData.ctx = ctx;
            obj.visible = false;
            this.ghostGroup.add(obj);
        }
    }

    private handleOnClick(e: MouseEvent) {
        if(this.Simulating) return;

        this.rayCaster.setFromCamera({x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1}, this.camera);
        var intersects = this.rayCaster.intersectObjects(this.scene.children);  
        if (intersects.length == 0) return;
        let index, strand;
        let obj = intersects[0].object;
        if (obj.parent?.name == "parities") {
            strand = obj.userData.strand;
            index = obj.userData.index;
        } else if (obj.parent?.name == "vertecies") {
            index = obj.userData.index;
        }
        dispatchEvent(new CustomEvent("lattice-clicked", {detail: {strand: strand, index: index}, bubbles: true}));
    }

    private updateLabel(newLabel: string, ctx: CanvasRenderingContext2D, backgroundColor: number, isInode: boolean) {
        let x = ctx.canvas.width / 4;
        let y = ctx.canvas.height / 2;
        let fontSize = 24;
        if (isInode) {
            x *= 2;
            fontSize *= 2;
        }
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "normal " + fontSize + "px sarif";
        switch (backgroundColor) {
            case COLORS.GREY:
                ctx.fillStyle = convertHexToStringColor(COLORS.BLUE);
                break;
            case COLORS.GREEN:
                ctx.fillStyle = convertHexToStringColor(COLORS.RED);
                break;
            case COLORS.BLUE:
                ctx.fillStyle = convertHexToStringColor(COLORS.GREY);
                break;
            case COLORS.RED:
                ctx.fillStyle = convertHexToStringColor(COLORS.GREEN);
                break;
            default:
                ctx.fillStyle = "black";
        }
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        if (newLabel.length > 4) {
            let l = newLabel.length
            ctx.fillText(newLabel.slice(0, l - 3), x, y - fontSize / 2);
            ctx.fillText(newLabel.slice(l - 3, l), x, y + fontSize / 2);

        } else {
            ctx.fillText(newLabel, x, y);
        }
    }

    private createTwoDimView() {
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
            vertex = this.vertices.get(startIndex)!;
            obj = this.verticesGroup.children[i];
            this.updateLabel(startIndex.toString(), obj.userData.ctx, vertex.Color, false);
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
                for (let i = 0; i < remainder; i++) {
                    this.verticesGroup.children[this.verticesGroup.children.length - 1 - i].visible = false;
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

        /* --- Flytter på parity blokkene --- */
        startIndex = this.drawFrom;
        this.lineGeomIndex = 0;
        this.ghostIndex = 0;
        for (let index = 0; index < this.limit; index++) {
            for (var [strand, output] of this.parities.entries()) {
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
        this.ghostGroup.visible = this.ghostgroupshow;
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

    // Takes in rightPos, LeftPos and Type (1 = RH, -1 = LH)
    // Returns a list with (xPosition, yPosition, counter) in given order.
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


    // Takes in index, (x,y,z) position and color) and return object
    private createGhostVertex(index: string, x: number, y: number, z: number, color: number) {

        var obj = this.ghostGroup.children[this.ghostIndex];
        //@ts-ignore
        this.updateLabel(index, obj.userData.ctx);
        //@ts-ignore
        obj.material.color.setHex(color);
        obj.position.set(x, y, z);
        //@ts-ignore
        obj.material.opacity = 0.3
        //@ts-ignore
        obj.material.transparent = true;
        obj.visible = true;

        this.ghostIndex++;


        return obj
    }

    public show_hide_ghostvertcies() {
        this.ghostgroupshow = !this.ghostgroupshow;
        this.ghostGroup.visible = this.ghostgroupshow;
    }

    private createLattice() {
        var deltaPi: number = (2 * Math.PI) / this.s;
        var column = - Math.ceil((this.limit / 2) / this.s)
        var row = 0;
        var startIndex = this.drawFrom;
        var vertex: Vertex;
        var parity: Parity;
        var obj: THREE.Object3D<THREE.Event>;
        var line: THREE.Line<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
        var inNodeCount = 0;

        for (var v of this.verticesGroup.children) {
            v.visible = true;
            v.name = "";
        }
        for (var ghostVertx of this.ghostGroup.children) {
            ghostVertx.visible = false;
        }

        for (var i = 0; i < this.limit; i++) {
            vertex = this.vertices.get(startIndex)!;
            obj = this.verticesGroup.children[i];
            this.updateLabel(startIndex.toString(), obj.userData.ctx, vertex.Color, false);
            obj.position.set(
                this.scale * column,
                this.scale * Math.cos(deltaPi * row),
                this.scale * Math.sin(deltaPi * row)
            )
            //@ts-ignore
            obj.material.color.setHex(vertex!.Color);
            //@ts-ignore
            obj.material.map.needsUpdate = true;
            obj.name = startIndex.toString();
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
        }


        for (var par of this.paritiesGroup.children) {
            par.visible = false;
        }
        startIndex = this.drawFrom;
        this.lineGeomIndex = 0;
        for (let index = 0; index < this.limit; index++) {
            for (var [strand, parityMap] of this.parities.entries()) {
                let parityPosition = this.parityShift.get(startIndex)!;
                parity = parityMap.get(parityPosition) as Parity;
                if (index + this.s < this.limit && parity.To != null && parity.From != null) {
                    line = this.paritiesGroup.children[this.lineGeomIndex] as THREE.Line;
                    let leftPos = this.scene.getObjectByName(parity.From!.toString());
                    let rightPos = this.scene.getObjectByName(parity.To!.toString());
                    if (typeof leftPos != "undefined" && typeof rightPos != "undefined") {
                        line.visible = true;
                        //@ts-ignore
                        line.material.color.setHex(parity.Color);
                        this.lineGeomIndex++;
                        let array = line.geometry.attributes.position;
                        array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z);
                        array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 2);
                        line!.geometry.attributes.position.needsUpdate = true;
                    }
                }
                startIndex++
                if (startIndex > this.nrOfVertices) {
                    startIndex = 1;
                }
            }
        }
    }
    private createTorus() {
        var vertex: Vertex;
        var parity: Parity;
        var line: THREE.Line<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
        var obj: THREE.Object3D<THREE.Event>;
        var nrPerRings = this.nrOfVertices / this.s;
        var deltaPi = (2 * Math.PI) / nrPerRings
        var deltaPi1 = (2 * Math.PI) / this.s
        var counter, inNodeCount = 0, lineGeomIndex = 0;
        const R = 3 * this.scale * this.s;
        const r = (this.scale / 4) * nrPerRings;

        for (let i = 0, c = 1; i < 2 * Math.PI; i += deltaPi1, c++) {
            counter = c
            for (let j = 0; j < 2 * Math.PI; j += deltaPi) {
                if (counter > this.vertices.size) {
                    continue
                }
                vertex = this.vertices.get(counter)!;
                obj = this.verticesGroup.children[counter - 1];
                this.updateLabel(counter.toString(), obj.userData.ctx, vertex.Color, false);
                obj.position.set(
                    ((R + r * Math.cos(j)) * Math.cos(i)),
                    ((R + r * Math.cos(j)) * Math.sin(i)),
                    (r * Math.sin(j))
                );
                obj.name = counter.toString();
                //@ts-ignore
                obj.material.color.setHex(vertex.Color);

                counter += this.s
            }
        }

        for (let index = 1; index <= this.limit; index++) {
            for (var [strand, parityMap] of this.parities.entries()) {
                let parityPosition = this.parityShift.get(index)!;
                parity = parityMap.get(parityPosition) as Parity;
                line = this.paritiesGroup.children[lineGeomIndex] as THREE.Line;
                if (index + this.s < this.limit && parity.To != null && parity.From != null) {
                    let leftPos = this.scene.getObjectByName(parity.From!.toString());
                    let rightPos = this.scene.getObjectByName(parity.To!.toString());
                    if (typeof leftPos != "undefined" && typeof rightPos != "undefined") {
                        line.visible = true;
                        //@ts-ignore
                        line.material.color.setHex(parity.Color);
                        let array = line.geometry.attributes.position;
                        array.setXYZ(0, leftPos!.position.x, leftPos!.position.y, leftPos!.position.z);
                        array.setXYZ(1, rightPos!.position.x, rightPos!.position.y, rightPos!.position.z);
                        line!.geometry.setDrawRange(0, 2);
                        line!.geometry.attributes.position.needsUpdate = true;
                    }
                } else {
                    line.visible = false;
                }
                lineGeomIndex++;
            }
        }
    }

    public GoTo(position: number) {
        this.view.GoTo(position);
    }

    public UpdateVertex(vertexIndex: number) {
        var vertex = this.scene.getObjectByName((vertexIndex).toString()) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>
        if (typeof vertex == "undefined") return
        vertex.material.color.setHex(this.vertices.get(vertexIndex)!.Color)
    }


    public onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update()
        for (var v of this.verticesGroup.children.filter((v) => v.visible)) {
            v.lookAt(this.camera.position);
        }
        for (var gv of this.ghostGroup.children.filter((gv) => gv.visible)) {
            gv.lookAt(this.camera.position);
        }
        this.view.Animate();
        this.render()
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    public set PanRight(value: boolean) {
        this.controls.panRight = value;
    }
    public set PanLeft(value: boolean) {
        this.controls.panLeft = value;
    }
    public set PanUp(value: boolean) {
        this.controls.panUp = value;
    }
    public set PanDown(value: boolean) {
        this.controls.panDown = value;
    }

    public Update() {
        this.view.Update();
    }
}




