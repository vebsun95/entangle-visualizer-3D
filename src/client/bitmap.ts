import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

export class BitMap extends DataContainer {

    canvases: HTMLCanvasElement[];
    container: HTMLDivElement;
    pixelHeight: number;
    pixelWidth: number;
    private visible: boolean = true;

    constructor(alpha: number, s: number, p: number, vertices: Vertices[]) {
        super(alpha, s, p, vertices);
        this.container = document.getElementById("bitmap-container") as HTMLDivElement;

        this.canvases = Array(this.alpha + 1);
        var footer = document.getElementById("footer");
        var button: HTMLButtonElement;
        
        for(let i = 0; i < this.alpha + 1; i++){
            
            button = footer?.insertBefore(document.createElement("button"), this.container) as HTMLButtonElement;
            button.id = "bitmap-view" + i.toString();
            button.innerText = "strand" + i.toString();
            button.addEventListener("click", () => this.changeView(i))
            this.canvases[i] = this.container.appendChild(document.createElement("canvas"));
            if (this.vertices.length / this.s < window.innerWidth ) {
                this.canvases[i].setAttribute("width", (this.container.clientWidth).toString() + "px")
            } else {
                this.canvases[i].setAttribute("width", (this.vertices.length / this.s).toString() + "px")
            }
            this.canvases[i].setAttribute("height", "100px")
            this.canvases[i].style.display = "none";
        }
        console.log(this.container.clientHeight)

        this.pixelHeight = Math.floor((window.innerHeight / 10) / this.s);
        this.pixelWidth = Math.ceil((this.container.clientWidth) / (this.vertices.length / this.s));

        this.canvases[0].style.display = "unset";

        document.getElementById("toggle-bitmap")?.addEventListener("click", this.toggleVisible.bind(this));
    }

    Draw() {
        
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
