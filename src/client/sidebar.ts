import { text } from "express";
import { Line } from "three";
import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";


export class SideBar extends DataContainer {

    private visible: boolean = true;
    private domEle: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    private statsEle: HTMLUListElement = document.getElementById("side-bar-stats") as HTMLUListElement;

    constructor(alpha: number, s: number, p: number, vertecies: Vertices[]) {
        super(alpha, s, p, vertecies);
        document.getElementById("toggle-side-bar")?.addEventListener("click", this.toggleVisible.bind(this));
        this.UpdateInfo();
        this.toggleVisible();
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

    private toggleVisible() {
        if (this.visible) {
            this.domEle.style.width = "1em";
            this.domEle.style.display = "none";
        } else {
            this.domEle.style.width = "";
        }
        this.visible = !this.visible;
    }
}