import { text } from "express";
import { type } from "os";
import { Line } from "three";
import { threadId } from "worker_threads";
import { COLORS, DLStatus, RepStatus } from "./constants";
import { DataContainer } from "./dataContainer";
import { DownloadEntryLog, Parity, ParityEvent, Vertex, VertexEvent } from "./interfaces";


export class SideBar extends DataContainer {

    private visible: boolean = true;
    private domEle: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    private statsEle: HTMLUListElement = document.getElementById("side-bar-stats") as HTMLUListElement;
    private fileInput: HTMLInputElement = document.createElement("input");
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

        for (var vertex of this.vertices.values()) {
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
            dispatchEvent(new CustomEvent("new-file-upload", { detail: { newContent: content } }))
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

        this.JumpBackButton.addEventListener("click", () => this.backClicked(10))
        this.BackButton.addEventListener("click", () => this.backClicked(1))
        this.PlayButton.addEventListener("click", this.playClicked.bind(this))
        this.JumpForwardButton.addEventListener("click", () => this.jumpForwardClicked(10));

        this.Container.append(this.JumpBackButton, this.BackButton, this.PlayButton, this.JumpForwardButton)
    }

    private backClicked(n: number) {
        if (this.currentPos > 0) {
            dispatchEvent(new Event("resetEverything"));
            var vertexEvents = [];
            var parityEvents = [];
            var newPosition = this.currentPos - n;
            var logEntry: DownloadEntryLog;
            this.currentPos = 0;
            for (; this.currentPos < newPosition; this.currentPos++) {
                logEntry = this.LogEntries[this.currentPos];
                if (logEntry.parity) {
                    parityEvents.push(this.parseLogParityEvent(logEntry))
                } else {
                    vertexEvents.push(this.parseLogVertexEntry(logEntry))
                }
            }
            dispatchEvent(new CustomEvent("logEntryEvents", { detail: { ParityEvents: parityEvents, VertexEvents: vertexEvents } }))
        }
    }


    // https://github.com/racin/entangle-visualizer/blob/master/logparser.go
    private playClicked() {
        if (this.currentPos < this.LogEntries.length) {
            var vertexEvents = [];
            var parityEvents = [];
            var logEntry: DownloadEntryLog;

            logEntry = this.LogEntries[this.currentPos];
            if (logEntry.parity) {
                parityEvents.push(this.parseLogParityEvent(logEntry))
            } else {
                vertexEvents.push(this.parseLogVertexEntry(logEntry))
            }

            this.currentPos++

            dispatchEvent(new CustomEvent("logEntryEvents", { detail: { ParityEvents: parityEvents, VertexEvents: vertexEvents } }))
        }
    }

    private jumpForwardClicked(n: number) {
        var vertexEvents = [];
        var parityEvents = [];
        var logEntry: DownloadEntryLog;
        for (let count = 0; count < n && this.currentPos < this.LogEntries.length; count++) {

            logEntry = this.LogEntries[this.currentPos];
            if (logEntry.parity) {
                parityEvents.push(this.parseLogParityEvent(logEntry))
            } else {
                vertexEvents.push(this.parseLogVertexEntry(logEntry))
            }

            this.currentPos++
        }

        dispatchEvent(new CustomEvent("logEntryEvents", { detail: { ParityEvents: parityEvents, VertexEvents: vertexEvents } }))
    }
    private parseLogVertexEntry(logEntry: DownloadEntryLog): VertexEvent {
        if (logEntry.downloadStatus === DLStatus.Failed && !logEntry.hasData) {
            return { Index: logEntry.position, NewColor: COLORS.RED }
        }
        else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
            return { Index: logEntry.position, NewColor: COLORS.BLUE }
        }
        //else if (logEntry.downloadStatus === DLStatus.Success) {
        return { Index: logEntry.position, NewColor: COLORS.GREEN }
    }

    private parseLogParityEvent(logEntry: DownloadEntryLog): ParityEvent {
        if (logEntry.downloadStatus === DLStatus.Failed && !logEntry.hasData) {
            return { From: logEntry.left!, To: logEntry.right!, NewColor: COLORS.RED, Adr: "a390e628aa1c57e8bc5d587de82a6779882e11cd033196a16e1d8d275808d0fc" }
        }
        else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
            return { From: logEntry.left!, To: logEntry.right!, NewColor: COLORS.BLUE, Adr: "a390e628aa1c57e8bc5d587de82a6779882e11cd033196a16e1d8d275808d0fc" }

        }
        //else if (logEntry.downloadStatus === DLStatus.Success) {
        return { From: logEntry.left!, To: logEntry.right!, NewColor: COLORS.GREEN, Adr: "a390e628aa1c57e8bc5d587de82a6779882e11cd033196a16e1d8d275808d0fc" }

    }
}