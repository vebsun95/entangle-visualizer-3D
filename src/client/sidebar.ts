import { text } from "express";
import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

const SVGURL = "http://www.w3.org/2000/svg";

export class SideBar extends DataContainer {

    private visible: boolean = true;
    private domEle: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    private statsEle : HTMLUListElement = document.getElementById("side-bar-stats") as HTMLUListElement;
    private originalMT : SVGElement = document.getElementById("original-merkle-tree") as unknown as SVGElement;
    private originOffsetX : number = this.originalMT.clientWidth / 2;
    private originOffsetY : number = this.originalMT.clientHeight / 2;

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

        for(var vertex of this.vertices){
            switch(vertex.Color) {
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
        const nrOfVertices = 25;
        const BranchingFactor = 14;
        var radius = 20;
        var circleSvg: SVGCircleElement;
        var textSvg: SVGTextElement;
        var rootNodeLevel = Math.ceil( Math.log(nrOfVertices) / Math.log(BranchingFactor) ) + 1;
        var nrOfNodesEachLevel = [1, 2, 22];
        var deltaPi, refX, refY: number;

        for (let level = 0; level <= rootNodeLevel; level++) {
            deltaPi = Math.PI / nrOfNodesEachLevel[level];
            refX = radius * 3 * level
            refY = 0
            for(let curLevel = 0; curLevel < 2 * Math.PI; curLevel += deltaPi) {
                circleSvg = document.createElementNS(SVGURL, "circle") as SVGCircleElement;
                textSvg = document.createElementNS(SVGURL, "text") as SVGTextElement;
                circleSvg.setAttributeNS(null, "cx", (this.originOffsetX + level * 3 * radius * Math.sin(curLevel)).toString());
                circleSvg.setAttributeNS(null, "cy", (this.originOffsetY + level * 3 * radius * Math.cos(curLevel)).toString());
                circleSvg.setAttributeNS(null, "r", (radius).toString());
                circleSvg.setAttributeNS(null, "stroke", "green");
                circleSvg.setAttributeNS(null, "fill", "none");
                this.originalMT.appendChild(circleSvg)
                textSvg.setAttributeNS(null, "x", (this.originOffsetX + level * 3 * radius * Math.sin(curLevel)).toString());
                textSvg.setAttributeNS(null, "y", (this.originOffsetY + level * 3 * radius * Math.cos(curLevel)).toString());
                textSvg.setAttributeNS(null, "text-anchor", "middle");
                textSvg.setAttributeNS(null, "dominant-baseline", "middle");
                textSvg.innerHTML = Math.floor(curLevel).toString();
                this.originalMT.appendChild(textSvg);
            }
            
        }


        // var circleSvg = document.createElementNS(SVGURL , "circle") as SVGCircleElement;
        // circleSvg.setAttributeNS(null, "cx", this.originOffsetX.toString())
        // circleSvg.setAttributeNS(null, "cy", this.originOffsetY.toString())
        // circleSvg.setAttributeNS(null, "r", radius.toString())
        // circleSvg.setAttributeNS(null, "stroke", "green");
        // circleSvg.setAttributeNS(null, "fill", "none");
        // var textSvg = document.createElementNS(SVGURL, "text") as SVGTextElement;
        // textSvg.setAttributeNS(null, "x", this.originOffsetX.toString());
        // textSvg.setAttributeNS(null, "y", (this.originOffsetY).toString());
        // textSvg.setAttributeNS(null, "text-anchor", "middle");
        // textSvg.setAttributeNS(null, "dominant-baseline", "middle");
        // textSvg.innerHTML = "999";
        // this.originalMT.appendChild(textSvg);
        // this.originalMT.appendChild(circleSvg);
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