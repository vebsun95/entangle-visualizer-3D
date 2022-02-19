import { text } from "express";
import { Line } from "three";
import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertex } from "./interfaces";


export class SideBar extends DataContainer {

    private visible: boolean = true;
    private domEle: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    private statsEle: HTMLUListElement = document.getElementById("side-bar-stats") as HTMLUListElement;
    private fileInput : HTMLInputElement = document.createElement("input");

    constructor() {
        super();
        document.getElementById("toggle-side-bar")?.addEventListener("click", this.toggleVisible.bind(this));
        this.UpdateInfo();
        this.createFileInput();
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
    
    private createFileInput() {
        this.fileInput.type = "file";
        this.fileInput.addEventListener("change", this.handleFileChange as EventListener)
        this.domEle.append(this.fileInput);
    }

    private handleFileChange(e: InputEvent) {
        const fileReader = new FileReader();
        let file = (e.target as HTMLInputElement).files![0];
        fileReader.onload = () => {
            var content: any
            content = JSON.parse(fileReader.result as string)
            dispatchEvent( new CustomEvent("new-file-upload", {detail: {newContent: content}}))
        }
        fileReader.readAsText(file, "UTF-8");
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