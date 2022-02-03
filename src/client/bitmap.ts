import { Interface } from "readline";
import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

export class BitMap extends DataContainer {

    private canvases: HTMLCanvasElement[] = Array(this.alpha + 1);;
    private container: HTMLDivElement = document.getElementById("bitmap-canvas-container") as HTMLDivElement;
    private ruler: HTMLCanvasElement = this.container.appendChild(document.createElement('canvas'));
    private pixelHeight: number = 15;
    private pixelWidth: number = Math.ceil((this.container.clientWidth) / (this.vertices.length / this.s));
    private visible: boolean = true;
    private viewBox: HTMLDivElement = document.getElementById("bitMap-viewBox")! as HTMLDivElement;
    private viewBoxLocked: HTMLDivElement = document.getElementById("bitMap-viewBox-locked") as HTMLDivElement;
    drawLimit: number = 250; 
    LabelMap : any = {0: "Original", 1: "Horizontal", 2: "RH-Strand", 3: "LH-Strand"}

    constructor(alpha: number, s: number, p: number, vertices: Vertices[]) {
        super(alpha, s, p, vertices);

        var footer = document.getElementById("bitmap-container");
        var button: HTMLButtonElement;
        
        for(let i = 0; i < this.alpha + 1; i++){

            
            button = footer?.insertBefore(document.createElement("button"), this.container) as HTMLButtonElement;
            button.id = "bitmap-view" + i.toString();
            button.innerText = this.LabelMap[i];
            button.addEventListener("click", () => this.changeView(i))
            this.canvases[i] = this.container.appendChild(document.createElement("canvas"));
            if (this.vertices.length / this.s < window.innerWidth ) {
                this.canvases[i].setAttribute("width", (this.container.clientWidth).toString() + "px")
            } else {
                this.canvases[i].setAttribute("width", (this.vertices.length / this.s).toString() + "px")
            }
            this.canvases[i].setAttribute("height", this.pixelHeight * this.s + "px")
            this.canvases[i].style.display = "none";
            this.canvases[i].classList.add("bitMapCanvas")
        }

        this.ruler.setAttribute("height", "20px");
        this.ruler.setAttribute("width", (this.vertices.length / this.s) + "px")
        this.ruler.classList.add("bitMapCanvas")

        this.canvases[0].style.display = "unset";

        document.getElementById("bitmap-viewbox-container")!.style.width = this.canvases[0].width + "px";

        this.viewBox.style.display = "none"
        this.viewBox.style.height = this.canvases[0].height.toString() + "px";
        this.viewBox.style.width = (this.pixelWidth * (this.drawLimit / this.s)).toString() + "px";

        this.viewBoxLocked.style.height = this.canvases[0].height.toString() + "px";
        this.viewBoxLocked.style.width = (this.pixelWidth * (this.drawLimit / this.s)).toString() + "px";
        
        this.container.addEventListener("mouseenter", () => this.viewBox.style.display = "unset");
        this.container.addEventListener("mouseleave", () => this.viewBox.style.display = "none");
        this.container.addEventListener("mousemove", (event : MouseEvent) => this.viewBox.style.left = (event.offsetX - this.viewBoxLocked.clientWidth / 2).toString() + "px");
        document.getElementById("toggle-bitmap")?.addEventListener("click", this.toggleVisible.bind(this));
    }

    Draw() {
        var rulerStep = 100;
        var rulerCtx = this.ruler.getContext('2d');
        var indexCounter: number;
        rulerCtx!.font = "1em white"
        rulerCtx!.fillStyle = "white";
        rulerCtx!.textAlign = "center";
        rulerCtx!.textBaseline = "middle";

        var ctxs = Array(this.alpha + 1);
        for(let i=0; i < this.canvases.length; i++) {
            ctxs[i] = this.canvases[i].getContext('2d');
        }

        var row = 0;
        var column = 0;
        var contextIndex: number;
        var color: string;

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
        let left = offsetX - this.viewBoxLocked.clientWidth / 2;
        // Check that the viewbox is within bounds.
        if (left + this.viewBoxLocked.clientWidth > this.container.scrollWidth) {
            this.viewBoxLocked.style.left = (this.container.scrollWidth - this.viewBoxLocked.clientWidth).toString() + "px";
        } else {
            this.viewBoxLocked.style.left = left.toString() + "px"
        }
        return column * this.s + row;
    }
    private convertHexToStringColor(hexColor: number) : string
    {
        let hexColorString = hexColor.toString(16);
        while(hexColorString.length < 6) {
            hexColorString = '0' + hexColorString;
        }
        hexColorString = '#' + hexColorString;
        return hexColorString;
    }
}
