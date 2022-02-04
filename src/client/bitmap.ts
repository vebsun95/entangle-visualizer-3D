import { Interface } from "readline";
import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

export class BitMap extends DataContainer {

    private canvases: HTMLCanvasElement[] = Array(this.alpha + 1);;
    private container: HTMLDivElement = document.getElementById("bitmap-canvas-container") as HTMLDivElement;
    private containerWidth: number = this.container.clientWidth;
    private ruler: HTMLCanvasElement = this.container.appendChild(document.createElement('canvas'));
    private rulerHeight: number = 20;
    private pixelHeight: number = 15;
    private pixelWidth: number = Math.ceil((this.container.clientWidth) / (this.vertices.length / this.s));
    private visible: boolean = true;
    private viewBox: HTMLDivElement = document.getElementById("bitMap-viewBox")! as HTMLDivElement;
    private viewBoxLocked: HTMLDivElement = document.getElementById("bitMap-viewBox-locked") as HTMLDivElement;
    private viewBoxWidith = 0;
    drawLimit: number = 250; 
    LabelMap : any = {0: "Original", 1: "Horizontal", 2: "RH-Strand", 3: "LH-Strand"}

    constructor(alpha: number, s: number, p: number, vertices: Vertices[]) {
        super(alpha, s, p, vertices);
        
        this.updateDynamicAttributes();
        this.updateDrawLimit();

        this.container.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.container.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
        this.container.addEventListener("mousemove", (event : MouseEvent) => this.handleMouseMove(event));
        document.getElementById("toggle-bitmap")?.addEventListener("click", this.toggleVisible.bind(this));
    }

    Draw() {
        var row = 0;
        var column = 0;
        var contextIndex: number; // Which canvas gets written to.
        var color: string;
        var rulerStep = 100; // How often do you mark the ruler.
        var rulerCtx = this.ruler.getContext('2d');
        var indexCounter: number; // Helper-variable to convert (row,column) to index
        rulerCtx!.font = "1em white"
        rulerCtx!.fillStyle = "white";
        rulerCtx!.textAlign = "center";
        rulerCtx!.textBaseline = "middle";

        var ctxs = Array(this.alpha + 1);
        // Get the context for all alpha + 1 canvases.
        for(let i=0; i < this.canvases.length; i++) {
            ctxs[i] = this.canvases[i].getContext('2d');
        }

        for (var vertex of this.vertices) {
            contextIndex = 0;
            color = this.convertHexToStringColor(vertex.Color);
            ctxs[contextIndex].fillStyle = color;
            ctxs[contextIndex].fillRect(
                column * this.pixelWidth,
                row * this.pixelHeight,
                this.pixelWidth,
                this.pixelHeight);
            contextIndex++;
            for (var output of vertex.Outputs) {
                ctxs[contextIndex].fillStyle = this.convertHexToStringColor(output.Color);
                ctxs[contextIndex].fillRect(
                    column * this.pixelWidth,
                    row * this.pixelHeight,
                    this.pixelWidth,
                    this.pixelHeight);
                contextIndex++;
            }
            if(column % rulerStep == 0 && row == 0){
                indexCounter = column * this.s + row;
                rulerCtx?.fillRect(column, 15, 2, 5)
                rulerCtx?.fillText(indexCounter.toString(), column, this.ruler.height / 2)
            }
            row = (row + 1) % this.s;
            if(row == 0) column++;  
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
        for(let i = 0; i < this.canvases.length; i++) {
            if(i === index) {
                this.canvases[i].style.display = "unset";
            } else {
                this.canvases[i].style.display = "none";
            }
        }
    }

    GetIndexFromCoord(offsetX: number, offsetY: number) : number {
        let column = Math.floor(offsetX / this.pixelWidth);
        let row = Math.floor(offsetY / this.pixelHeight);
        // move viewBoxLocked to viewBox position.
        this.viewBoxLocked.style.left = this.viewBox.style.left;
        return column * this.s + row;
    }

    private convertHexToStringColor(hexColor: number) : string
    {
        let hexColorString = hexColor.toString(16);
        // 0xFFFFFF
        while(hexColorString.length < 6) {
            hexColorString = '0' + hexColorString;
        }
        hexColorString = '#' + hexColorString;
        return hexColorString;
    }

    private updateDynamicAttributes() {
        var mainContainer = document.getElementById("bitmap-container");
        var changeViewButton: HTMLButtonElement;

        /* 
            if nr of columns needed, with pixelwidth = 1, is larger than screen
            the container is scrollable
        */
        if (this.vertices.length / this.s > window.innerWidth ) {
            this.containerWidth = this.nrOfVertices / this.s;
        }
        
        for(let i = 0; i < this.alpha + 1; i++){
            changeViewButton = mainContainer?.insertBefore(document.createElement("button"), this.container) as HTMLButtonElement;
            changeViewButton.id = "bitmap-view" + i.toString();
            changeViewButton.innerText = this.LabelMap[i];
            changeViewButton.addEventListener("click", () => this.changeView(i))
            this.canvases[i] = this.container.appendChild(document.createElement("canvas"));
            this.canvases[i].setAttribute("width", this.containerWidth.toString() + "px");
            this.canvases[i].setAttribute("height", this.pixelHeight * this.s + "px")
            this.canvases[i].style.display = "none";
            this.canvases[i].classList.add("bitMapCanvas")
        }

        this.ruler.setAttribute("height", this.rulerHeight.toString() + "px");
        this.ruler.setAttribute("width", (this.vertices.length / this.s) + "px");
        this.ruler.classList.add("bitMapCanvas")

        this.canvases[0].style.display = "unset";

        document.getElementById("bitmap-viewbox-container")!.style.width = this.containerWidth.toString() + "px";
    }

    private updateDrawLimit() {
        this.viewBoxWidith = this.pixelWidth * (this.drawLimit / this.s);

        this.viewBox.style.display = "none"
        this.viewBox.style.height = this.canvases[0].height.toString() + "px";
        this.viewBox.style.width = (this.viewBoxWidith).toString() + "px";

        this.viewBoxLocked.style.height = this.canvases[0].height.toString() + "px";
        this.viewBoxLocked.style.width = (this.viewBoxWidith).toString() + "px";
    }

    private updateVertex(vertexIndex : number) {

    }

    private handleMouseEnter() {
        this.viewBox.style.display = "unset"
    }

    private handleMouseLeave() {
        this.viewBox.style.display = "none"
    }

    private handleMouseMove(event : MouseEvent) {
        if(event.offsetX + this.viewBoxWidith / 2 > this.containerWidth) {
            this.viewBox.style.width = (this.containerWidth - event.offsetX).toString() + "px";
        } else {
            this.viewBox.style.width = (this.viewBoxWidith).toString() + "px";
        }
        this.viewBox.style.left = (event.offsetX - this.viewBoxLocked.clientWidth / 2).toString() + "px"
    }
}