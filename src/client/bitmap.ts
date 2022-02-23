import { DataContainer } from "./dataContainer";

interface vec2 {
    x: number,
    y: number,
}

export class BitMap extends DataContainer {

    private viewButtons: HTMLButtonElement[] = []
    private latticeCanvases: HTMLCanvasElement[] = []
    private container: HTMLDivElement = document.getElementById("bitmap-canvas-container") as HTMLDivElement;
    private containerWidth: number = this.container.clientWidth;
    private ruler: HTMLCanvasElement = this.container.appendChild(document.createElement('canvas'));
    private treeCanvases: HTMLCanvasElement[] = [];
    private treeCanvasesLookup: Map<number, vec2>[] = [];
    private rulerHeight: number = 20;
    private pixelHeight: number = 15;
    private pixelWidth: number = 1;
    private visible: boolean = true;
    private viewBox: HTMLDivElement = document.getElementById("bitMap-viewBox")! as HTMLDivElement;
    private viewBoxLocked: HTMLDivElement = document.getElementById("bitMap-viewBox-locked") as HTMLDivElement;
    private viewBoxWidth = 0;
    drawLimit: number = 1;
    LabelMap: any = { 0: "Original", 1: "Horizontal", 2: "RH-Strand", 3: "LH-Strand" }

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

        var LatticeCtxs = Array(this.alpha + 1);
        var TreeCtxs = Array(this.alpha + 1);
        var oldPos: vec2;
        var oldPosMaps: Map<number, vec2>[] = Array(this.alpha + 1);
        var newPos: vec2;
        // Get the context for all alpha + 1 canvases.
        for (let i = 0; i < this.alpha + 1; i++) {
            LatticeCtxs[i] = this.latticeCanvases[i].getContext('2d');
            TreeCtxs[i] = this.treeCanvases[i].getContext('2d');
            for(let j = 1; j < this.maxDepth; j++) {
                oldPosMaps[i] = new Map();
                oldPosMaps[i].set(j, {x: 0, y: this.pixelHeight * (j - 2)});
            }
        }

        for (var vertex of this.vertices) {
            contextIndex = 0;
            color = this.convertHexToStringColor(vertex.Color);
            LatticeCtxs[contextIndex].fillStyle = color;
            LatticeCtxs[contextIndex].fillRect(
                column * this.pixelWidth, // X
                row * this.pixelHeight,   // Y
                this.pixelWidth,          // Width
                this.pixelHeight)         // Height;
            if (vertex.Depth > 1 && vertex.Depth < this.maxDepth) {
                oldPos = oldPosMaps[contextIndex].get(vertex.Depth)!;
                console.log(oldPos.x, oldPos.y, column, row);
                TreeCtxs[contextIndex].fillStyle = color;
                TreeCtxs[contextIndex].fillRect(
                    oldPos.x,
                    oldPos.y,
                    column * this.pixelWidth,
                    this.pixelHeight,
                )
                TreeCtxs[contextIndex].fillStyle = "black";
                TreeCtxs[contextIndex].strokeRect(
                    oldPos.x,
                    oldPos.y,
                    column * this.pixelWidth,
                    this.pixelHeight,
                )
                
                oldPosMaps[contextIndex].set(vertex.Depth, {x: column * this.pixelWidth, y: oldPos.y})
                this.treeCanvasesLookup[contextIndex].set(vertex.Index, {x: column * this.pixelWidth, y: row * this.pixelHeight,})
            }
            contextIndex++;
            for (var output of vertex.Outputs) {
                LatticeCtxs[contextIndex].fillStyle = this.convertHexToStringColor(output.Color);
                LatticeCtxs[contextIndex].fillRect(
                    column * this.pixelWidth,
                    row * this.pixelHeight,
                    this.pixelWidth,
                    this.pixelHeight);
                contextIndex++;
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

    private changeView(index: number) {
        for (let i = 0; i < this.latticeCanvases.length; i++) {
            if (i === index) {
                this.latticeCanvases[i].style.display = "unset";
                this.treeCanvases[i].style.display = "unset";
            } else {
                this.latticeCanvases[i].style.display = "none";
                this.treeCanvases[i].style.display = "none";
            }
        }
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
        var mainContainer = document.getElementById("bitmap-container");
        /*  Delete Old Buttons */
        for (var oldButton of this.viewButtons) {
            oldButton.parentNode?.removeChild(oldButton);
        }
        this.viewButtons = Array(this.alpha + 1);

        /* Delete Old Canvases */
        for (var oldCanvas of this.latticeCanvases) {
            oldCanvas.parentNode?.removeChild(oldCanvas)
        }
        this.latticeCanvases = Array(this.alpha + 1);
        /* Delete Old treeCanvases */
        for (var oldTreeCanvas of this.treeCanvases) {
            oldTreeCanvas.parentNode?.removeChild(oldTreeCanvas);
        }
        this.treeCanvases = Array(this.alpha + 1);
        /* Reset the lookup-table */
        this.treeCanvasesLookup = Array(this.alpha + 1);
        /* 
            if nr of columns needed, with pixelwidth = 1, is larger than screen
            the container is scrollable
        */
        if (this.nrOfVertices / this.s > window.innerWidth) {
            this.pixelWidth = 1;
            this.containerWidth = Math.ceil(this.nrOfVertices / this.s) + 5;
        } else {
            this.pixelWidth = Math.floor(window.innerWidth / Math.ceil(this.nrOfVertices / this.s))
        }

        // i == 0 -> original tree / latice
        for (let i = 0; i < this.alpha + 1; i++) {
            this.treeCanvases[i] = this.container.appendChild(document.createElement("canvas"));
            this.treeCanvases[i].setAttribute("width", this.containerWidth.toString() + "px");
            this.treeCanvases[i].setAttribute("height", ((this.maxDepth - 2) * this.pixelHeight).toString() + "px");
            this.treeCanvases[i].style.display = "none";
            this.treeCanvases[i].classList.add("bitMapCanvas")

            this.treeCanvasesLookup[i] = new Map();

            this.viewButtons[i] = mainContainer?.insertBefore(document.createElement("button"), this.container) as HTMLButtonElement;
            this.viewButtons[i].id = "bitmap-view" + i.toString();
            this.viewButtons[i].innerText = this.LabelMap[i];
            this.viewButtons[i].addEventListener("click", () => this.changeView(i))
            this.latticeCanvases[i] = this.container.appendChild(document.createElement("canvas"));
            this.latticeCanvases[i].setAttribute("width", this.containerWidth.toString() + "px");

            this.latticeCanvases[i].setAttribute("height", this.pixelHeight * this.s + "px")
            this.latticeCanvases[i].style.display = "none";
            this.latticeCanvases[i].classList.add("bitMapCanvas")

        }

        this.ruler.setAttribute("height", this.rulerHeight.toString() + "px");
        this.ruler.setAttribute("width", (this.vertices.length / this.s) + "px");
        this.ruler.classList.add("bitMapCanvas")

        this.latticeCanvases[0].style.display = "unset";
        this.treeCanvases[0].style.display = "unset";

        document.getElementById("bitmap-viewbox-container")!.style.width = this.containerWidth.toString() + "px";
    }

    private updateDrawLimit() {
        this.viewBoxWidth = this.pixelWidth * (this.drawLimit / this.s);

        this.viewBox.style.display = "none"
        this.viewBox.style.height = this.latticeCanvases[0].height.toString() + "px";
        this.viewBox.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBox.style.bottom = "0";

        this.viewBoxLocked.style.height = this.latticeCanvases[0].height.toString() + "px";
        this.viewBoxLocked.style.width = (this.viewBoxWidth).toString() + "px";
        this.viewBoxLocked.style.bottom = "0";
    }

    UpdateVertex(vertexIndex: number) {
        let ctx = this.latticeCanvases[0].getContext("2d");
        let col = Math.floor(vertexIndex / this.s)
        let row = Math.floor(vertexIndex % this.s)
        ctx!.fillStyle = this.convertHexToStringColor(this.vertices[vertexIndex].Color);
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
}