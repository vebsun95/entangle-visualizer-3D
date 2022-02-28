import { text } from "express";
import { Line } from "three";
import { threadId } from "worker_threads";
import { COLORS, DLStatus, RepStatus } from "./constants";
import { DataContainer } from "./dataContainer";
import { DownloadEntryLog, Vertex } from "./interfaces";


export class SideBar extends DataContainer {

    private visible: boolean = true;
    private domEle: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    private statsEle: HTMLUListElement = document.getElementById("side-bar-stats") as HTMLUListElement;
    private fileInput : HTMLInputElement = document.createElement("input");
    PlayBackEle: PlayBack = new PlayBack();

    constructor() {
        super();
        document.getElementById("toggle-side-bar")?.addEventListener("click", this.toggleVisible.bind(this));

        this.domEle.append(this.PlayBackEle.Container);

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
            content = JSON.parse("[" + (fileReader.result as string).split("\n").join(",") + "]")
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
class PlayBack {

    Container: HTMLDivElement = document.createElement("div");
    private JumpBackButton: HTMLButtonElement = document.createElement("button");
    private BackButton: HTMLButtonElement = document.createElement("button");
    private PlayButton: HTMLButtonElement = document.createElement("button");
    private JumpForwardButton: HTMLButtonElement = document.createElement("button");
    LogEntries: DownloadEntryLog[] = [];
    private currentPos: number = 0;

    constructor() {
        this.createButtons();
    }

    private createButtons() {
        this.JumpBackButton.innerHTML = "<<";
        this.BackButton.innerHTML = "<";
        this.PlayButton.innerHTML = ">";
        this.JumpForwardButton.innerHTML = ">>";

        this.JumpBackButton.addEventListener("click", this.jumpBackClicked.bind(this))
        this.BackButton.addEventListener("click", this.backClicked.bind(this))
        this.PlayButton.addEventListener("click", this.playClicked.bind(this))
        this.JumpForwardButton.addEventListener("click", this.jumpForwardClicked.bind(this))

        this.Container.append(this.JumpBackButton, this.BackButton, this.PlayButton, this.JumpForwardButton)
    }

    private jumpBackClicked() {
        while(this.currentPos > 1) {
            this.backClicked();
        }
    }

    private backClicked() {
        if( this.currentPos > 0 ) {
            this.currentPos--;
            var logEntry = this.LogEntries[this.currentPos];
            if (!logEntry.parity) {
                if (logEntry.downloadStatus === DLStatus.Failed && !logEntry.hasData) {
                    dispatchEvent(new CustomEvent("logEntryEvent", {detail: {index: logEntry.position, newColor: COLORS.RED}}))
                } 
                else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
                    dispatchEvent(new CustomEvent("logEntryEvent", {detail: {index: logEntry.position, newColor: COLORS.BLUE}}))
                }
                else if (logEntry.downloadStatus === DLStatus.Success) {
                    dispatchEvent(new CustomEvent("logEntryEvent", {detail: {index: logEntry.position, newColor: COLORS.GREEN}}))
                }
            } else {
                dispatchEvent(new CustomEvent("logEntryParityEvent", {detail: {left: logEntry.left, right: logEntry.right, newColor: COLORS.BLUE}}))
            }
            
            if( logEntry.downloadStatus === DLStatus.Pending ) {
                this.playClicked();
            }
        }
    }
    // https://github.com/racin/entangle-visualizer/blob/master/logparser.go
    private playClicked() {
        if ( this.currentPos < this.LogEntries.length ) {
            var logEntry = this.LogEntries[this.currentPos];
            if (!logEntry.parity) {
                if (logEntry.downloadStatus === DLStatus.Failed && !logEntry.hasData) {
                    dispatchEvent(new CustomEvent("logEntryEvent", {detail: {index: logEntry.position, newColor: COLORS.RED}}))
                } 
                else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
                    dispatchEvent(new CustomEvent("logEntryEvent", {detail: {index: logEntry.position, newColor: COLORS.BLUE}}))
                }
                else if (logEntry.downloadStatus === DLStatus.Success) {
                    dispatchEvent(new CustomEvent("logEntryEvent", {detail: {index: logEntry.position, newColor: COLORS.GREEN}}))
                }
            } else {
                dispatchEvent(new CustomEvent("logEntryParityEvent", {detail: {left: logEntry.left, right: logEntry.right, newColor: COLORS.BLUE}}))
            }
            
            this.currentPos++;
            if( logEntry.downloadStatus === DLStatus.Pending ) {
                this.playClicked();
            }
        }
    }

    private jumpForwardClicked() {
        while(this.currentPos < this.LogEntries.length) {
            this.playClicked();
        }
    }
}