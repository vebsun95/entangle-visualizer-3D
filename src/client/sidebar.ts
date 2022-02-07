import { text } from "express";
import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

const SVGURL = "http://www.w3.org/2000/svg";

interface pos {
    x: number,
    y: number,
}

export class SideBar extends DataContainer {

    private visible: boolean = true;
    private domEle: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    private statsEle: HTMLUListElement = document.getElementById("side-bar-stats") as HTMLUListElement;
    private originalMT: SVGElement = document.getElementById("original-merkle-tree") as unknown as SVGElement;
    private originOffsetX: number = this.originalMT.clientWidth / 2;
    private originOffsetY: number = this.originalMT.clientHeight / 2;
    private radius: number = 20;

    constructor(alpha: number, s: number, p: number, vertecies: Vertices[]) {
        super(alpha, s, p, vertecies);
        document.getElementById("toggle-side-bar")?.addEventListener("click", this.toggleVisible.bind(this));
        this.UpdateInfo();
        this.createOMT()
    }

    UpdateInfo() {
        var li: HTMLLIElement;
        var nrOfDownloaded = 0;
        var nrOfUnavailable = 0;
        var nrOfRepaired = 0;

        this.statsEle.innerHTML = ""

        for (var vertex of this.vertices) {
            switch (vertex.Color) {
                case COLORS.GREEN:
                    nrOfDownloaded++
                    break;
                case COLORS.BLUE:
                    nrOfRepaired++
                    break;
                case COLORS.RED:
                    nrOfUnavailable++
                    break
            }
        }
        li = document.createElement("li");
        li.innerText = `(${this.alpha}, ${this.s}, ${this.p})`
        this.statsEle.appendChild(li)

        li = document.createElement("li");
        li.innerText = "Data elements: " + this.nrOfVertices;
        this.statsEle.appendChild(li)

        li = document.createElement("li");
        li.innerText = "Downloaded: " + nrOfDownloaded;
        this.statsEle.appendChild(li)

        li = document.createElement("li");
        li.innerText = "Unavailable: " + nrOfUnavailable;
        this.statsEle.appendChild(li)

        li = document.createElement("li");
        li.innerText = "Repaired: " + nrOfRepaired;
        this.statsEle.appendChild(li)
    }
    private createOMT() {

        interface Node {
            index: number,
            parent: number,
            depth: number,
        }

        

        var nodes : Node[]= [
            {index: 1,  parent: 15, depth: 1 },
            {index: 2,  parent: 15, depth: 1 },
            {index: 3,  parent: 15, depth: 1 },
            {index: 4,  parent: 15, depth: 1 },
            {index: 5,  parent: 15, depth: 1 },
            {index: 6,  parent: 15, depth: 1 },
            {index: 7,  parent: 15, depth: 1 },
            {index: 8,  parent: 15, depth: 1 },
            {index: 9,  parent: 15, depth: 1 },
            {index: 10, parent: 15, depth: 1 },
            {index: 11, parent: 15, depth: 1 },
            {index: 12, parent: 15, depth: 1 },
            {index: 13, parent: 15, depth: 1 },
            {index: 14, parent: 15, depth: 1 },
            {index: 15, parent: 25, depth: 2 },
            {index: 16, parent: 24, depth: 1 },
            {index: 17, parent: 24, depth: 1 },
            {index: 18, parent: 24, depth: 1 },
            {index: 19, parent: 24, depth: 1 },
            {index: 20, parent: 24, depth: 1 },
            {index: 21, parent: 24, depth: 1 },
            {index: 22, parent: 24, depth: 1 },
            {index: 23, parent: 24, depth: 1 },
            {index: 24, parent: 25, depth: 2 },
            {index: 25, parent: 0,  depth: 3 },
        ];

        nodes.sort(function(a, b){return b.depth - a.depth})
        //var rootNodeLevel = Math.ceil(Math.log(nrOfVertices) / Math.log(BranchingFactor)) + 1;
        var rootNodeLevel = 3;

        var posMap = new Map<number, pos>();

        const nrOfVertices = 25;
        const BranchingFactor = 14;
        var radius = 20;
        var circleSvg: SVGCircleElement;
        var textSvg: SVGTextElement;
        var nrOfNodesEachLevel = [1, 2, 22];
        var deltaPi, refX, refY, x, y: number;
        var index = 1;

        // Start by placing the root node.
        this.placeCircle(0, 0, "green", nodes[0].index.toString());
        posMap.set(25, {x: 0, y:0})
        for(var level = 1; level < nrOfNodesEachLevel.length; level++) {
            deltaPi = (Math.PI * 2) /  nrOfNodesEachLevel[level]
            for(var offset=0; offset < Math.PI * 2; offset+= deltaPi, index++) {
                if(index > 24) continue;
                x = 4 * level * radius * Math.cos(offset);
                y = 4 * level * radius * Math.sin(offset);
                this.placeCircle(x, y, "green", nodes[index].index.toString())
                posMap.set(nodes[index].index, {x: x, y:y})
                if(nodes[index].parent != 0)
                {
                    console.log(index)
                    this.drawLine({x: x, y: y}, {x: posMap.get(nodes[index].parent)!.x, y: posMap.get(nodes[index].parent)!.y})
                }
            }
        }
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

        this.originalMT.appendChild(circleSvg)
        this.originalMT.appendChild(textSvg);
        
    }

    private drawLine(from: pos, to: pos) {
        var lineSvg = document.createElementNS(SVGURL, "line") as SVGLineElement;

        lineSvg.setAttributeNS(null, "x1", (this.originOffsetX + from.x).toString());
        lineSvg.setAttributeNS(null, "y1", (this.originOffsetY + from.y).toString());

        lineSvg.setAttributeNS(null, "x2", (this.originOffsetX + to.x).toString());
        lineSvg.setAttributeNS(null, "y2", (this.originOffsetY + to.y).toString());

        lineSvg.setAttributeNS(null, "stroke", "black");

        this.originalMT.appendChild(lineSvg);

    }

    private toggleVisible() {
        if (this.visible) {
            this.domEle.style.width = "1em";
        } else {
            this.domEle.style.width = "";
        }
        this.visible = !this.visible;
    }
}