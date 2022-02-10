import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

const SVGURL = "http://www.w3.org/2000/svg";


export class MerkelTreeViewer extends DataContainer {

    private container: HTMLDivElement = document.getElementById("tree-container") as HTMLDivElement;
    private svgElement: SVGElement = document.getElementById("original-merkel-tree") as unknown as SVGElement;
    private leafGroups: SVGElement[] = Array(4);
    private internalNodes: SVGCircleElement[] = Array(4 + 1);
    private originOffsetX: number = 0;
    private originOffsetY: number = 0;
    private radius: number = 30;
    private nrOfleafGroups: number = 4;
    private leafNodeWidth: number = 8;
    private leafNodeHeight: number = 8;
    private margin: number = 4;
    private view: number = 0;


    constructor(alpha: number, s: number, p: number, vertices: Vertices[]) {
        super(alpha, s, p, vertices);
        
        this.updateDynamicAttributes();
        this.generateNodes();
    }


    private generateNodes() {

        /* Clear svg container containers */
        while (this.svgElement.firstChild) {
            this.svgElement.removeChild(this.svgElement.firstChild);
        }

        /* Generate InternalNodes */
        var nrOfInternalNodes = 4 + 1;
        var internalNode: SVGCircleElement;
        for(let i=0; i < nrOfInternalNodes - 1; i++) {
            internalNode = document.createElementNS(SVGURL, "circle");
            internalNode.setAttributeNS(null, "r", this.radius.toString());
            internalNode.id = "IN" + (i).toString();
        }

        this.placeCircle(0, 0, "lightgreen", "93933");
        this.placeCircle(-this.radius * 3, -this.radius * 2, "lightgreen", "1");
        this.placeCircle(-this.radius * 3, this.radius * 2, "lightgreen", "2");
        this.placeCircle(this.radius * 3, -this.radius * 2, "lightgreen", "3");
        this.placeCircle(this.radius * 3, this.radius * 2, "lightgreen", "4");


        var nrOfColumns = 16;
        var nrOfRows = 8;
        var maxDepth = 3;
        var x = [-this.radius * 6, -this.radius * 8, this.radius * 6, this.radius * 8]
        var y = [-this.radius * 0, this.radius * 0, -this.radius * 0, this.radius * 0]
        // Root node;
        for(let i=0; i<4; i++){
            var childNodeGroup = document.createElementNS(SVGURL, "svg");
            childNodeGroup.setAttributeNS(null, "x", (x[i] + this.originOffsetX).toString());
            childNodeGroup.setAttributeNS(null, "y", (y[i] + this.originOffsetY).toString());
            childNodeGroup.setAttributeNS(null, "width", (this.leafNodeWidth * nrOfColumns).toString());
            childNodeGroup.setAttributeNS(null, "height", (this.leafNodeHeight * nrOfRows).toString());
    
            var leafNode: SVGRectElement;
            for(let i = 0; i < 128; i++) {
                leafNode = document.createElementNS(SVGURL, "rect");
                leafNode.setAttributeNS(null, "width", this.leafNodeWidth.toString())
                leafNode.setAttributeNS(null, "height", this.leafNodeHeight.toString())
                leafNode.setAttributeNS(null, "x", ((i % nrOfColumns) * this.leafNodeWidth).toString())
                leafNode.setAttributeNS(null, "y", (Math.floor(i / nrOfColumns) * this.leafNodeHeight).toString())
                leafNode.setAttributeNS(null, "fill", this.randomColor());
                leafNode.setAttributeNS(null, "stroke", "none")
                
                childNodeGroup.appendChild(leafNode);
            }
            childNodeGroup.addEventListener("mousemove", (e: MouseEvent) => { childNodeGroup.setAttributeNS(null, "x", (Number(childNodeGroup.getAttributeNS(null, "x")) + 1).toString()) })
            this.svgElement.appendChild(childNodeGroup);
        }
    }

    private drawOMT() {

    }

    private randomColor() : string {
        let random = Math.random()
        if( random < 0.5 ) return "grey";
        if( random < 0.7 ) return "red";
        return "green";
    }

    private updateDynamicAttributes() {
        this.svgElement.style.height = (window.innerHeight * 0.3).toString() + "px";
        this.svgElement.style.width = window.innerWidth.toString() + "px";
        this.originOffsetX = this.svgElement.clientWidth / 2;
        this.originOffsetY = this.svgElement.clientHeight / 2;
    }

    private placeCircle(x: number, y: number, color: string, label: string) {
        var circleSvg = document.createElementNS(SVGURL, "circle") as SVGCircleElement;
        var textSvg = document.createElementNS(SVGURL, "text") as SVGTextElement;
        circleSvg.setAttributeNS(null, "cx", (this.originOffsetX + x).toString());
        circleSvg.setAttributeNS(null, "cy", (this.originOffsetY + y).toString());
        circleSvg.setAttributeNS(null, "r", (this.radius).toString());
        circleSvg.setAttributeNS(null, "stroke", "black");
        circleSvg.setAttributeNS(null, "fill", color);

        textSvg.setAttributeNS(null, "x", (this.originOffsetX + x).toString());
        textSvg.setAttributeNS(null, "y", (this.originOffsetY + y + 2).toString());
        textSvg.setAttributeNS(null, "text-anchor", "middle");
        textSvg.setAttributeNS(null, "dominant-baseline", "middle");
        textSvg.innerHTML = label;

        this.svgElement.appendChild(circleSvg)
        this.svgElement.appendChild(textSvg);
        
    }

}