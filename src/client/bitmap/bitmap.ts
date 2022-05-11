import { Vec2 } from "three";
import { DataContainer } from "../SharedKernel/dataContainer";
import { Vertex } from "../SharedKernel/interfaces";
import { convertHexToStringColor } from "../SharedKernel/utils";
import { BitMapClickedEvent } from "./Events/bitMapClicked";
import { rect, vec2 } from "./interfaces/interfaces";


export class BitMap extends DataContainer {

    public Container: HTMLDivElement = document.createElement("div");
    public DrawLimit: number = 250;
    private canvasContainer: HTMLDivElement = document.createElement("div");
    private ruler: HTMLCanvasElement = document.createElement('canvas');
    private treeCanvases: HTMLCanvasElement = document.createElement("canvas");
    private latticeCanvas: HTMLCanvasElement = document.createElement("canvas");
    private containerWidth: number = window.innerWidth;
    private treeCanvasesLookup: Map<number, rect> = new Map();
    private rulerHeight: number = 20;
    private pixelHeight: number = 15;
    private pixelWidth: number = 1;
    private visible: boolean = true;
    private viewBoxContainer: HTMLDivElement = document.createElement("div");
    private viewBox: HTMLDivElement = document.createElement("div");
    private viewBoxLocked: HTMLDivElement = document.createElement("div");
    private viewBoxWidth = 0;

    constructor() {
        super();
        this.createLayout();
        this.Hide();
    }
    private createLayout() {

        this.Container.id = "bitmap-container";
        this.viewBoxContainer.id = "bitmap-viewbox-container";
        this.viewBox.id = "bitMap-viewBox";
        this.viewBoxLocked.id = "bitMap-viewBox-locked";
        this.canvasContainer.id = "bitmap-canvas-container"

        this.Container.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.Container.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
        this.Container.addEventListener("mousemove", (event: MouseEvent) => this.handleMouseMove(event));
        this.Container.addEventListener("mousedown", this.handleMouseDown.bind(this));

        this.viewBoxContainer.append(this.viewBox, this.viewBoxLocked);
        this.canvasContainer.append(this.ruler, this.viewBoxContainer, this.treeCanvases, this.latticeCanvas);

        this.Container.append(this.canvasContainer);
    }

    public HandleUpdatedData() {
        this.updateDynamicAttributes();
        this.updateDrawLimit();
        this.fillLookUpTable();
        this.createRuler();
        this.Update();
    }

    public Update() {
        var row: number;
        var column: number;
        var color: string;
        var vertex: Vertex;
        var latticeCtx = this.latticeCanvas.getContext("2d")!;
        var treeCtx = this.treeCanvases.getContext("2d")!;

        for (var [position, vertex] of this.vertices.entries()) {
            column = Math.floor((position - 1) / this.s)
            row = (position - 1) % this.s
            color = convertHexToStringColor(vertex.Color);
            latticeCtx.fillStyle = color;
            latticeCtx.fillRect(
                column * this.pixelWidth, // X
                row * this.pixelHeight,   // Y
                this.pixelWidth,          // Width
                this.pixelHeight)         // Height;
            if (vertex.Depth > 1 && vertex.Depth < this.maxDepth) {
                let dim = this.treeCanvasesLookup.get(position)!;
                treeCtx.fillStyle = color;
                treeCtx.fillRect(dim.x, dim.y, dim.width, dim.height);
                treeCtx.fillStyle = "black";
                treeCtx.strokeRect(dim.x, dim.y, dim.width, dim.height);
            }
        }
    }

    private fillLookUpTable() {
        var oldPosMap: Map<number, vec2> = new Map();
        var oldPos: Vec2, width: number;
        for (let depth = 2; depth < this.maxDepth; depth++) {
            oldPosMap.set(depth, { x: 0, y: this.pixelHeight * (this.maxDepth - depth - 1) })
        }

        this.treeCanvasesLookup.clear();
        for (var [position, vertex] of [...this.vertices.entries()]
            .filter((v) => { return v[1].Depth > 1 && v[1].Depth < this.maxDepth })
            .sort((a, b) => a[1].Index - b[1].Index)) {
            oldPos = oldPosMap.get(vertex.Depth)!;
            width = (Math.ceil(vertex.Index / this.s) * this.pixelWidth) - oldPos.x;
            oldPosMap.set(vertex.Depth, { x: oldPos.x + width, y: oldPos.y })
            this.treeCanvasesLookup.set(position, { x: oldPos.x, y: oldPos.y, width: width, height: this.pixelHeight })
        }
    }

    private createRuler() {
        var rulerStep = window.innerWidth / 7 - 1; // How often do you mark the ruler.
        var ctx = this.ruler.getContext('2d')!;
        var index: number;
        // Clear the old ruler.
        ctx.clearRect(0, 0, this.ruler.width, this.ruler.height);

        // Setup
        ctx.font = "1em white"
        ctx.fillStyle = "white";
        ctx.textBaseline = "middle";

        //First placement
        ctx.textAlign = "left";
        index = Math.floor((0 / this.pixelWidth)) * this.s;
        ctx.fillRect(0, 15, 2, 5);
        ctx.fillText(index.toString(), 0, this.ruler.height / 2);

        // not first or last placements
        ctx.textAlign = "center";
        for (var offsetX = rulerStep; offsetX <= this.containerWidth - rulerStep; offsetX += rulerStep) {
            index = Math.floor((offsetX / this.pixelWidth)) * this.s;
            ctx.fillRect(offsetX, 15, 2, 5);
            ctx.fillText(index.toString(), offsetX, this.ruler.height / 2);
        }

        // Last placement
        offsetX = this.containerWidth;
        ctx.textAlign = "right";
        index = Math.floor((offsetX / this.pixelWidth)) * this.s;
        ctx.fillRect(offsetX, 15, 2, 5);
        ctx.fillText(index.toString(), offsetX, this.ruler.height / 2);
    }

    private toggleVisible() {
        if (this.visible) {
            this.Container.classList.remove("showBitMap");
            this.Container.classList.add("hideBitMap");
        } else {
            this.Container.classList.remove("hideBitMap");
            this.Container.classList.add("showBitMap");
        }
        this.visible = !this.visible;
    }

    private getIndexFromCoord(offsetX: number, offsetY: number): number {
        let column = Math.floor(offsetX / this.pixelWidth);
        let row = Math.floor(offsetY / this.pixelHeight);

        return column * this.s + row;
    }

    private getCoordFromIndex(vertexIndex: number): [number, number] {
        let row = vertexIndex % this.s;
        let column = Math.floor(vertexIndex / this.s);
        let offsetX = column * this.pixelWidth;
        let offsetY = row * this.pixelHeight;
        return [offsetX, offsetY];
    }

    private updateDynamicAttributes() {
        /* 
            if nr of columns needed, with pixelwidth = 1, is larger than screen
            the container is scrollable
        */
        if (this.nrOfVertices / this.s > window.innerWidth) {
            this.pixelWidth = 1;
            this.containerWidth = Math.ceil(this.nrOfVertices / this.s) + 1;
        } else {
            this.pixelWidth = Math.ceil(window.innerWidth / Math.ceil(this.nrOfVertices / this.s))
            this.containerWidth = window.innerWidth;
        }

        this.treeCanvases.setAttribute("width", this.containerWidth.toString() + "px");
        this.treeCanvases.setAttribute("height", (Math.max((this.maxDepth - 2), 0) * this.pixelHeight).toString() + "px");
        this.treeCanvases.classList.add("bitMapCanvas");

        this.latticeCanvas.setAttribute("width", this.containerWidth.toString() + "px");
        this.latticeCanvas.setAttribute("height", this.pixelHeight * this.s + "px")
        this.latticeCanvas.classList.add("bitMapCanvas")


        this.ruler.setAttribute("height", this.rulerHeight.toString() + "px");
        this.ruler.setAttribute("width", (this.containerWidth).toString() + "px");
        this.ruler.classList.add("bitMapCanvas")


        this.viewBoxContainer.style.width = this.containerWidth.toString() + "px";
    }

    private updateDrawLimit() {
        this.viewBoxWidth = this.pixelWidth * (this.DrawLimit / this.s);
        if(this.viewBoxWidth >= window.innerWidth / 2) {
            this.viewBoxWidth = this.pixelWidth;
        }

        this.viewBox.style.display = "none"
        this.viewBox.style.height = this.latticeCanvas.height.toString() + "px";
        this.viewBox.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBox.style.bottom = "0";

        this.viewBoxLocked.style.height = this.latticeCanvas.height.toString() + "px";
        this.viewBoxLocked.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBoxLocked.style.bottom = "0";
    }

    private handleMouseEnter() {
        this.viewBox.style.display = "unset"
    }

    private handleMouseLeave() {
        this.viewBox.style.display = "none"
    }

    private handleMouseMove(event: MouseEvent) {
        if (event.offsetX + this.viewBoxWidth / 2 > this.containerWidth) {
            this.viewBox.style.width = (this.containerWidth - event.offsetX + (this.viewBox.clientWidth / 2) - 10).toString() + "px";
        } else {
            this.viewBox.style.width = (this.viewBoxWidth).toString() + "px";
        }
        this.viewBox.style.left = (event.offsetX - this.viewBox.clientWidth / 2).toString() + "px"
    }

    private handleMouseDown(event: MouseEvent) {
        // move viewBoxLocked to viewBox position.
        this.viewBoxLocked.style.left = this.viewBox.style.left;
        this.viewBoxLocked.style.width = this.viewBox.style.width;

        var vertexIndex = this.getIndexFromCoord(event.offsetX, event.offsetY);
        this.Container.dispatchEvent( new BitMapClickedEvent({bubbles: true}, vertexIndex) )
    }

    public onWindowResize() {
        this.updateDynamicAttributes();
        this.fillLookUpTable();
        this.createRuler();
        this.Update();
    }

    public SimulateClick(vertexIndex: number) {
        let coords = this.getCoordFromIndex(vertexIndex);
        this.viewBoxLocked.style.left = (Math.max(coords[0] - this.viewBoxWidth / 2, 0) ).toString() + "px";
        this.latticeCanvas.scrollTo(Math.max( coords[0] - this.viewBoxWidth / 2, 0), 0);
        this.Container.dispatchEvent( new BitMapClickedEvent({bubbles: true}, vertexIndex) )
    }

    public Hide() {
        this.visible = true;
        this.toggleVisible();
    }

    public Show() {
        this.visible = false;
        this.toggleVisible();
    }
}

