import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";

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

    private container: HTMLDivElement = document.getElementById("bitmap-canvas-container") as HTMLDivElement;
    private latticeCanvas: HTMLCanvasElement = this.container.appendChild(document.createElement("canvas"));
    private containerWidth: number = this.container.clientWidth;
    private ruler: HTMLCanvasElement = this.container.appendChild(document.createElement('canvas'));
    private treeCanvases: HTMLCanvasElement = this.container.appendChild( document.createElement("canvas"));
    private treeCanvasesLookup: Map<number, rect> = new Map();
    private rulerHeight: number = 20;
    private pixelHeight: number = 15;
    private pixelWidth: number = 1;
    private visible: boolean = true;
    private viewBox: HTMLDivElement = document.getElementById("bitMap-viewBox")! as HTMLDivElement;
    private viewBoxLocked: HTMLDivElement = document.getElementById("bitMap-viewBox-locked") as HTMLDivElement;
    private viewBoxWidth = 0;
    drawLimit: number = 1;

    constructor() {
        super();

        this.container.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.container.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
        this.container.addEventListener("mousemove", (event: MouseEvent) => this.handleMouseMove(event));
        this.container.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.getElementById("toggle-bitmap")?.addEventListener("click", this.toggleVisible.bind(this));
    }

    HandleUpdatedData() {
        this.updateDynamicAttributes();
        this.updateDrawLimit();
        this.draw();
    }

    private draw() {

        var row = 0;
        var column = 0;
        var contextIndex: number; // Which canvas gets drawn on.
        var color: string;
        var rulerStep = 100; // How often do you mark the ruler.
        var rulerCtx = this.ruler.getContext('2d');
        var indexCounter: number; // Helper-variable to convert (row,column) to index
        rulerCtx!.font = "1em white"
        rulerCtx!.fillStyle = "white";
        rulerCtx!.textAlign = "center";
        rulerCtx!.textBaseline = "middle";

        var latticeCtx = this.latticeCanvas.getContext("2d")!;
        var treeCtx = this.latticeCanvas.getContext("2d")!;
        var oldPos: vec2;
        var oldPosMap: Map<number, vec2> = new Map();
        for(let depth=0; depth < this.maxDepth; depth++) {
            oldPosMap.set(depth, {x: 0, y: this.pixelHeight * (this.maxDepth - depth - 1)});
        }

        latticeCtx.fillStyle = this.convertHexToStringColor(COLORS.GREY);
        latticeCtx.fillRect(0, 0, this.latticeCanvas.width, this.latticeCanvas.height);

        for (let vertex of this.vertices.values()) {
            if (vertex.Depth > 1 && vertex.Depth < this.maxDepth) {
                oldPos = oldPosMap.get(vertex.Depth)!;
                treeCtx.fillStyle = this.convertHexToStringColor(vertex.Color);
                treeCtx.fillRect(
                    oldPos.x,
                    oldPos.y,
                    oldPos.x - column * this.pixelWidth,
                    this.pixelHeight,
                )
                treeCtx.fillStyle = "black";
                treeCtx.strokeRect(
                    oldPos.x,
                    oldPos.y,
                    oldPos.x - column * this.pixelWidth,
                    this.pixelHeight,
                )
                
                oldPosMap.set(vertex.Depth, {x: column * this.pixelWidth, y: oldPos.y})
                this.treeCanvasesLookup.set(vertex.Index, {x: oldPos.x, y: oldPos.y, width: oldPos.x - column * this.pixelWidth, height: this.pixelHeight})
            }
            if (column % rulerStep == 0 && row == 0) {
                indexCounter = column * this.s + row;
                rulerCtx?.fillRect(column, 15, 2, 5)
                rulerCtx?.fillText(indexCounter.toString(), column, this.ruler.height / 2)
            }
            row = (row + 1) % this.s;
            if (row == 0) column++;
        }
    }

    private toggleVisible() {
        if (this.visible) {
            this.container.classList.remove("showBitMap")
            this.container.classList.add("hideBitMap")
        } else {
            this.container.classList.remove("hideBitMap")
            this.container.classList.add("showBitMap")
        }
        this.visible = !this.visible;
    }

    private getIndexFromCoord(offsetX: number, offsetY: number): number {
        let column = Math.floor(offsetX / this.pixelWidth);
        let row = Math.floor(offsetY / this.pixelHeight);

        return column * this.s + row;
    }

    private convertHexToStringColor(hexColor: number): string {
        let hexColorString = hexColor.toString(16);
        // 0xFFFFFF
        while (hexColorString.length < 6) {
            hexColorString = '0' + hexColorString;
        }
        hexColorString = '#' + hexColorString;
        return hexColorString;
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
            this.pixelWidth = Math.floor(window.innerWidth / Math.ceil(this.nrOfVertices / this.s))
        }

        // i == 0 -> original tree / latice
        for (let i = 0; i < this.alpha + 1; i++) {

            this.treeCanvases.setAttribute("width", this.containerWidth.toString() + "px");
            this.treeCanvases.setAttribute("height", ((this.maxDepth - 2) * this.pixelHeight).toString() + "px");
            this.treeCanvases.style.display = "none";
            this.treeCanvases.classList.add("bitMapCanvas")

            this.treeCanvasesLookup.clear()

            this.latticeCanvas.setAttribute("width", this.containerWidth.toString() + "px");
            this.latticeCanvas.setAttribute("height", this.pixelHeight * this.s + "px")
            this.latticeCanvas.classList.add("bitMapCanvas")

        }

        this.ruler.setAttribute("height", this.rulerHeight.toString() + "px");
        this.ruler.setAttribute("width", (this.nrOfVertices / this.s) + "px");
        this.ruler.classList.add("bitMapCanvas")


        document.getElementById("bitmap-viewbox-container")!.style.width = this.containerWidth.toString() + "px";
    }

    private updateDrawLimit() {
        this.viewBoxWidth = this.pixelWidth * (this.drawLimit / this.s);

        this.viewBox.style.display = "none"
        this.viewBox.style.height = this.latticeCanvas.height.toString() + "px";
        this.viewBox.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBox.style.bottom = "0";

        this.viewBoxLocked.style.height = this.latticeCanvas.height.toString() + "px";
        this.viewBoxLocked.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBoxLocked.style.bottom = "0";
    }

    UpdateVertex(vertexIndex: number) {
        let ctx = this.latticeCanvas.getContext("2d");
        let col = Math.floor(vertexIndex / this.s)
        let row = Math.floor(vertexIndex % this.s)
        ctx!.fillStyle = this.convertHexToStringColor(this.vertices.get(vertexIndex)!.Color);
        ctx?.fillRect(col * this.pixelWidth, row * this.pixelHeight, this.pixelWidth, this.pixelHeight);
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

    onWindowResize() {
        if (this.pixelWidth > 1) {
                this.treeCanvases.setAttribute("width", window.innerWidth.toString() + "px");
                this.latticeCanvas.setAttribute("width", window.innerWidth.toString() + "px");
        }
    }
}