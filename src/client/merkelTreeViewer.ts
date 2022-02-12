import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

const SVGURL = "http://www.w3.org/2000/svg";

interface InternalNode {
    Container: SVGElement,
    Circle: SVGCircleElement,
    Label: SVGTextElement,
}

interface LeafGroup {
    Container: SVGElement,
    LeafNodes: SVGRectElement[],
}

export class MerkelTreeViewer extends DataContainer {

    private container: HTMLDivElement = document.getElementById("tree-container") as HTMLDivElement;
    private svgElement: SVGElement = document.getElementById("original-merkel-tree") as unknown as SVGElement;
    private leafGroups: LeafGroup[] = Array(6);
    private internalNodes: InternalNode[] = Array(6);
    private rootNode: InternalNode = {
        Container: document.createElementNS(SVGURL, "svg"),
        Circle: document.createElementNS(SVGURL, "circle"),
        Label: document.createElementNS(SVGURL, "text")
    };
    private originOffsetX: number = 0;
    private originOffsetY: number = 0;
    private radius: number = 30;
    private leafNodeWidth: number = 8;
    private leafNodeHeight: number = 8;
    private view: number = 0;
    private branchingFactor: number = 128;
    private nrOfRows: number = 12;
    private nrOfColm: number = 12;


    constructor(alpha: number, s: number, p: number, vertices: Vertices[]) {
        super(alpha, s, p, vertices);

        this.updateDynamicAttributes();
        this.generateNodes();
        this.drawOMT();
    }


    private generateNodes() {

        /* Clear svg container */
        while (this.svgElement.firstChild) {
            this.svgElement.removeChild(this.svgElement.firstChild);
        }

        /* Create the rootNode */
        this.rootNode.Container.setAttribute("x", (this.originOffsetX).toString());
        this.rootNode.Container.setAttribute("y", (this.originOffsetY).toString());
        this.rootNode.Container.setAttribute("height", (this.radius * 2).toString());
        this.rootNode.Container.setAttribute("width", (this.radius * 2).toString());

        this.rootNode.Circle.setAttribute("cx", (this.radius).toString());
        this.rootNode.Circle.setAttribute("cy", (this.radius).toString());
        this.rootNode.Circle.setAttribute("r", (this.radius).toString());
        this.rootNode.Circle.setAttribute("fill", "none");
        this.rootNode.Circle.setAttribute("stroke", "black");

        this.rootNode.Label.setAttribute("x", (this.radius).toString());
        this.rootNode.Label.setAttribute("y", (this.radius + 2).toString());
        this.rootNode.Label.setAttribute("text-anchor", "middle");
        this.rootNode.Label.setAttribute("dominant-baseline", "middle");
        this.rootNode.Label.innerHTML = "root";

        this.rootNode.Container.append(this.rootNode.Circle, this.rootNode.Label);

        this.svgElement.append(this.rootNode.Container);
        
        /* Create InternalNodes */
        var internalNode: InternalNode
        var x = [this.originOffsetX - 90, this.originOffsetX + 90, this.originOffsetX - 120, this.originOffsetX + 120, this.originOffsetX - 90, this.originOffsetX + 90]
        var y = [this.originOffsetY - 200, this.originOffsetY - 200, this.originOffsetY, this.originOffsetY, this.originOffsetY + 200, this.originOffsetY + 200]
        for (var i = 0; i < this.internalNodes.length; i++) {

            internalNode = {
                Container: document.createElementNS(SVGURL, "svg"),
                Circle: document.createElementNS(SVGURL, "circle"),
                Label: document.createElementNS(SVGURL, "text")
            };

            internalNode.Container.setAttribute("x", (x[i]).toString());
            internalNode.Container.setAttribute("y", (y[i]).toString());
            internalNode.Container.setAttribute("height", (this.radius * 2).toString());
            internalNode.Container.setAttribute("width", (this.radius * 2).toString());

            internalNode.Circle.setAttribute("r", (this.radius).toString());
            internalNode.Circle.setAttribute("cx", (this.radius).toString());
            internalNode.Circle.setAttribute("cy", (this.radius).toString());
            internalNode.Circle.setAttribute("fill", "none");
            internalNode.Circle.setAttribute("stroke", "black");

            internalNode.Label.setAttribute("x", (this.radius).toString());
            internalNode.Label.setAttribute("y", (this.radius + 2).toString());
            internalNode.Label.setAttribute("text-anchor", "middle");
            internalNode.Label.setAttribute("dominant-baseline", "middle");
            internalNode.Label.innerHTML = `IN ${i}`;

            internalNode.Container.append(internalNode.Circle, internalNode.Label);

            this.svgElement.append(internalNode.Container);
        }

        /* Create Leaf groups */
        var leafGroup : LeafGroup;
        var leaf: SVGRectElement;
        x = [this.originOffsetX - 200, this.originOffsetX + 200, this.originOffsetX - 230, this.originOffsetX + 230, this.originOffsetX - 200, this.originOffsetX + 200]
        y = [this.originOffsetY - 200, this.originOffsetY - 200, this.originOffsetY, this.originOffsetY, this.originOffsetY + 200, this.originOffsetY + 200]

        for( var i=0; i < this.leafGroups.length; i++ ) {
            leafGroup = {
                Container: document.createElementNS(SVGURL, "svg"),
                LeafNodes: Array(this.branchingFactor),
            };

            leafGroup.Container.setAttribute("width", (this.leafNodeWidth * this.nrOfColm).toString());
            leafGroup.Container.setAttribute("height", (this.leafNodeHeight * this.nrOfRows).toString());
            leafGroup.Container.setAttribute("x", (x[i].toString()));
            leafGroup.Container.setAttribute("y", (y[i].toString()));

            for (var j=0; j<this.branchingFactor; j++) {
                leaf = document.createElementNS(SVGURL, "rect");
                leaf.setAttribute("width", (this.leafNodeWidth).toString());
                leaf.setAttribute("height", (this.leafNodeHeight).toString());
                leaf.setAttribute("x", ((j % this.nrOfColm) * this.leafNodeWidth).toString());
                leaf.setAttribute("y", (Math.floor(j / this.nrOfColm) * this.leafNodeHeight).toString());
                leaf.setAttribute("stroke", "none");
                leaf.setAttribute("fill", this.randomColor());
                leafGroup.LeafNodes[j] = leaf;

                leafGroup.Container.append(leaf);
            }
            this.leafGroups[i] = leafGroup;
            this.svgElement.append(leafGroup.Container);
        }
    }

    private drawOMT() {
        //setInterval(this.test.bind(this), 1000);
        console.log(this.GetInternalNodes(0, 250));
    }

    private test() {
        for(var leafGroup of this.leafGroups) {
            for(var leaf of leafGroup.LeafNodes) {
                leaf.setAttribute("fill", this.randomColor());
            }
        }
        console.log("TEST");
    }

    private randomColor(): string {
        let random = Math.random()
        if (random < 0.5) return "grey";
        if (random < 0.7) return "red";
        return "green";
    }

    private updateDynamicAttributes() {
        this.svgElement.style.height = (window.innerHeight * 1).toString() + "px";
        this.svgElement.style.width = window.innerWidth.toString() + "px";
        this.originOffsetX = this.svgElement.clientWidth / 2;
        this.originOffsetY = this.svgElement.clientHeight / 2;
    }

    private placeCircle(x: number, y: number, color: string, label: string) {
        var circleSvg = document.createElementNS(SVGURL, "circle") as SVGCircleElement;
        var textSvg = document.createElementNS(SVGURL, "text") as SVGTextElement;
        circleSvg.setAttribute("cx", (this.originOffsetX + x).toString());
        circleSvg.setAttribute("cy", (this.originOffsetY + y).toString());
        circleSvg.setAttribute("r", (this.radius).toString());
        circleSvg.setAttribute("stroke", "black");
        circleSvg.setAttribute("fill", color);

        textSvg.setAttribute("x", (this.originOffsetX + x).toString());
        textSvg.setAttribute("y", (this.originOffsetY + y + 2).toString());
        textSvg.setAttribute("text-anchor", "middle");
        textSvg.setAttribute("dominant-baseline", "middle");
        textSvg.innerHTML = label;

        this.svgElement.appendChild(circleSvg)
        this.svgElement.appendChild(textSvg);

    }

}