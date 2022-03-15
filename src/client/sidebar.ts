
import { COLORS, DLStatus, RepStatus } from "./constants";
import { DataContainer } from "./dataContainer";
import { DownloadEntryLog, ParityEvent, VertexEvent } from "./interfaces";


export class SideBar {

    private visible: boolean = true;
    private container: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    private fileInput: HTMLInputElement = document.createElement("input");
    PlayBackEle: PlayBack = new PlayBack();

    constructor() {
        document.getElementById("toggle-side-bar")?.addEventListener("click", this.toggleVisible.bind(this));

        this.container.append(this.PlayBackEle.Container);

        this.createFileInput();
    }
    private createFileInput() {
        this.fileInput.type = "file";
        this.fileInput.addEventListener("change", this.handleFileChange as EventListener)
        this.container.append(this.fileInput);
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
            this.container.style.width = "1em";
        } else {
            this.container.style.width = "";
        }
        this.visible = !this.visible;
    }

}

interface StatsList {
    list: HTMLUListElement,
    parameters: HTMLLIElement,
    dataElemnts: HTMLLIElement,
    downloaded: ListItem,
    unavailable: ListItem,
    repaired: ListItem,
}

interface ListItem {
    li: HTMLLIElement;
    span: HTMLSpanElement;
}

class PlayBack {

    Container: HTMLDivElement = document.createElement("div");
    private statsList: StatsList = {
        list: document.createElement("ul"),
        parameters: document.createElement("li"),
        dataElemnts: document.createElement("li"),
        downloaded: {
            li: document.createElement("li"),
            span: document.createElement("span")},
        unavailable: {
            li: document.createElement("li"),
            span: document.createElement("span")},
        repaired: {
            li: document.createElement("li"),
            span: document.createElement("span")},
    };
    private JumpBackButton: HTMLButtonElement = document.createElement("button");
    private BackButton: HTMLButtonElement = document.createElement("button");
    private PlayButton: HTMLButtonElement = document.createElement("button");
    private JumpForwardButton: HTMLButtonElement = document.createElement("button");
    private slider: HTMLInputElement = document.createElement("input");
    LogEntries: DownloadEntryLog[] = [];
    private currentPos: number = 0;

    constructor() {
        this.createLayout();
    }

    private createLayout() {
        var sl = this.statsList;

        sl.downloaded.li.innerText = 'Downloaded: ';
        sl.downloaded.li.append(sl.downloaded.span);

        sl.unavailable.li.innerText = "Unavailable: ";
        sl.unavailable.li.append(sl.unavailable.span);

        sl.repaired.li.innerText = "Repaired: ";
        sl.repaired.li.append(sl.repaired.span);

        sl.list.append(
            sl.parameters,
            sl.dataElemnts,
            sl.downloaded.li,
            sl.unavailable.li,
            sl.repaired.li,
        );

        this.JumpBackButton.innerHTML = "<<";
        this.BackButton.innerHTML = "<";
        this.PlayButton.innerHTML = ">";
        this.JumpForwardButton.innerHTML = ">>";

        this.JumpBackButton.addEventListener("click", () => this.backClicked(10));
        this.BackButton.addEventListener("click", () => this.backClicked(1));
        this.PlayButton.addEventListener("click", () => this.forwardClicked(1));
        this.JumpForwardButton.addEventListener("click", () => this.forwardClicked(10));

        this.slider.setAttribute("type", "range");
        this.slider.setAttribute("min", "0");
        this.slider.addEventListener("change", this.handleSliderChange.bind(this));


        this.Container.append(this.statsList.list, this.JumpBackButton, this.BackButton, this.PlayButton, this.JumpForwardButton, this.slider);
    }

    HandleUpdatedData(alpha: number, s: number, p: number, dataElements: number) {
        this.statsList.parameters.innerHTML = `(${alpha}, ${s}, ${p})`;
        this.statsList.dataElemnts.innerText = `Data Elements: ${dataElements}`;
        this.slider.valueAsNumber = 0;
        this.slider.setAttribute("max", this.LogEntries.length.toString());
        this.resetStats();
    }

    private resetStats() {
        this.statsList.downloaded.span.innerText = (0).toString();
        this.statsList.unavailable.span.innerText = (0).toString();
        this.statsList.repaired.span.innerText = (0).toString();
    }

    UpdateStats(downloaded: number, unavailable: number, repaired: number) {
        this.statsList.downloaded.span.innerText = (downloaded).toString();
        this.statsList.unavailable.span.innerText = (unavailable).toString();
        this.statsList.repaired.span.innerText = (repaired).toString();
    }

    private backClicked(n: number) {
        if (this.currentPos > 0) {
            dispatchEvent(new Event("resetEverything"));
            this.resetStats();
            var oldpos = this.currentPos;
            this.currentPos = 0;
            this.forwardClicked(Math.max(oldpos - n, 0));
        }
    }

    // https://github.com/racin/entangle-visualizer/blob/master/logparser.go
    private forwardClicked(n: number) {
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
            this.currentPos++;
        }
        this.slider.valueAsNumber = this.currentPos;

        dispatchEvent(new CustomEvent("logEntryEvents", { detail: { ParityEvents: parityEvents, VertexEvents: vertexEvents } }))
    }
    private parseLogVertexEntry(logEntry: DownloadEntryLog): VertexEvent {
        if (logEntry.downloadStatus === DLStatus.Failed && !logEntry.hasData) {
            return { Position: logEntry.position, NewColor: COLORS.RED }
        }
        else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
            return { Position: logEntry.position, NewColor: COLORS.BLUE }
        }
        //else if (logEntry.downloadStatus === DLStatus.Success) {
        return { Position: logEntry.position, NewColor: COLORS.GREEN }
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

    private handleSliderChange() {
        var newValue: number = this.slider.valueAsNumber;
        if (newValue < this.currentPos) {
            this.backClicked(this.currentPos - newValue);
        }
        else if( newValue > this.currentPos) {
            this.forwardClicked(newValue - this.currentPos);
        }
    }
}