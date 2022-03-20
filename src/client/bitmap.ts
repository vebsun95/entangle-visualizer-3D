import { Vec2 } from "three";
import { DataContainer } from "./dataContainer";
import { Vertex } from "./interfaces";
import { convertHexToStringColor } from "./utils";

interface vec2 {
    x: number,
    y: number,
}

interface rect {
    x: number,
    y: number,
    width: number,
    height: number,
}

export class BitMap extends DataContainer {

    public Container: HTMLDivElement = document.createElement("div");
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
    public DrawLimit: number = 1;

    constructor() {
        super();

        this.createLayout();

    }
    private createLayout() {

        this.Container.id = "bitmap-container";
        this.viewBoxContainer.id = "bitmap-viewbox-container";
        this.viewBox.id = "bitMap-viewBox";
        this.viewBoxLocked.id ="bitMap-viewBox-locked";
        this.canvasContainer.id = "bitmap-canvas-container"

        this.Container.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.Container.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
        this.Container.addEventListener("mousemove", (event: MouseEvent) => this.handleMouseMove(event));
        this.Container.addEventListener("mousedown", this.handleMouseDown.bind(this));
        
        this.viewBoxContainer.append(this.viewBox, this.viewBoxLocked);
        this.canvasContainer.append(this.ruler, this.viewBoxContainer, this.treeCanvases, this.latticeCanvas);

        this.Container.append(this.canvasContainer);
    }
    HandleUpdatedData() {
        this.updateDynamicAttributes();
        this.updateDrawLimit();
        this.fillLookUpTable();
        this.createRuler();
        this.draw();
    }

    private draw() {
        var row = 0;
        var column = 0;
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
        var oldPos: Vec2, width: number, row: number = 0, column: number = 0;
        for (let depth = 2; depth < this.maxDepth; depth++) {
            oldPosMap.set(depth, { x: 0, y: this.pixelHeight * (this.maxDepth - depth - 1) })
        }

        this.treeCanvasesLookup.clear();
        for (var [position, vertex] of [...this.vertices.entries()].sort((a, b) => a[1].Index - b[1].Index)) {
            if (vertex.Depth > 1 && vertex.Depth < this.maxDepth) {
                oldPos = oldPosMap.get(vertex.Depth)!;
                width = (Math.ceil(vertex.Index  / this.s) * this.pixelWidth) - oldPos.x;
                oldPosMap.set(vertex.Depth, { x: oldPos.x + width, y: oldPos.y })
                this.treeCanvasesLookup.set(position, { x: oldPos.x, y: oldPos.y, width: width, height: this.pixelHeight })
            }
            row = (row + 1) % this.s;
            if (row == 0) column++;
        }
    }

    private createRuler() {
        var rulerStep = Math.ceil(Math.log10(this.nrOfVertices) * (this.nrOfVertices / 10)); // How often do you mark the ruler.
        var rulerCtx = this.ruler.getContext('2d')!;
        var x: number; // Helper-variable to convert (row,column) to index
        // Clear the old ruler.
        rulerCtx.clearRect(0, 0,this.ruler.width, this.ruler.height);
        rulerCtx.font = "1em white"
        rulerCtx.fillStyle = "white";
        rulerCtx.textAlign = "center";
        rulerCtx.textBaseline = "middle";
        for(var c=0; c < this.nrOfVertices; c += rulerStep) {
            x = Math.floor(c / this.s) * this.pixelWidth;
            rulerCtx.fillRect(x * this.pixelWidth, 15, 2, 5)
            rulerCtx.fillText(c.toString(), x, this.ruler.height / 2)
        }
        
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
        }

        this.treeCanvases.setAttribute("width", this.containerWidth.toString() + "px");
        this.treeCanvases.setAttribute("height", ((this.maxDepth - 2) * this.pixelHeight).toString() + "px");
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

        this.viewBox.style.display = "none"
        this.viewBox.style.height = this.latticeCanvas.height.toString() + "px";
        this.viewBox.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBox.style.bottom = "0";

        this.viewBoxLocked.style.height = this.latticeCanvas.height.toString() + "px";
        this.viewBoxLocked.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBoxLocked.style.bottom = "0";
    }

    public UpdateVertex(vertexPositions: number[]) {
        let latticeCtx = this.latticeCanvas.getContext("2d")!;
        for(var vertexPosition of vertexPositions) {
            var vertex = this.vertices.get(vertexPosition);
            if (typeof vertex == "undefined") {
                return;
            }
            let col = Math.floor((vertexPosition - 1) / this.s)
            let row = (vertexPosition - 1) % this.s
            let color = convertHexToStringColor(vertex.Color);
            latticeCtx.fillStyle = color;
            latticeCtx.fillRect(col * this.pixelWidth, row * this.pixelHeight, this.pixelWidth, this.pixelHeight);
            if (vertex.Depth > 1 && vertex.Depth < this.maxDepth) {
                var treeCtx = this.treeCanvases.getContext("2d")!;
                let dim = this.treeCanvasesLookup.get(vertexPosition)!;
                treeCtx.fillStyle = color;
                treeCtx.fillRect(dim.x, dim.y, dim.width, dim.height);
                treeCtx.fillStyle = "black";
                treeCtx.strokeRect(dim.x, dim.y, dim.width, dim.height);
            }
        }
    }

    private handleMouseEnter() {
        this.viewBox.style.display = "unset"
    }

    private handleMouseLeave() {
        this.viewBox.style.display = "none"
    }

    private handleMouseMove(event: MouseEvent) {
        if (event.offsetX + this.viewBoxWidth / 2 > this.containerWidth) {
            this.viewBox.style.width = (this.containerWidth - event.offsetX + (this.viewBox.clientWidth / 2)).toString() + "px";
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
        dispatchEvent(new CustomEvent("bitmap-clicked", { detail: { vertexIndex: vertexIndex } }))
    }

    public Reset() {
        this.draw();
    }

    public onWindowResize() {
        this.updateDynamicAttributes();
        this.fillLookUpTable();
        this.draw();
    }

    public SimulateClick(vertexIndex: number) {
        let coords = this.getCoordFromIndex(vertexIndex);
        this.viewBoxLocked.style.left = coords[0].toString() + "px";
        this.latticeCanvas.scrollTo(coords[0] - window.innerWidth / 2, 0);
        dispatchEvent(new CustomEvent("bitmap-clicked", { detail: { vertexIndex: vertexIndex } }))
    }
}