
import { COLORS, DLStatus, RepStatus } from "./constants";
import { DownloadEntryLog, ParityEvent, VertexEvent } from "./interfaces";
import { convertHexToStringColor } from "./utils";

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

interface LogTable {
    table: HTMLTableElement,
    rows: LogRow[],
}

interface LogRow {
    row: HTMLTableRowElement,
    logPosition: HTMLTableCellElement,
    position: HTMLTableCellElement,
    dlStatus: HTMLTableCellElement,
    repStatus: HTMLTableCellElement,
}

interface ListItem {
    li: HTMLLIElement,
    countValue: HTMLSpanElement,
}

interface Slider {
    container: HTMLDivElement,
    input: HTMLInputElement,
    currentPosition: HTMLSpanElement,
    endPosition: HTMLSpanElement,
}


class PlayBack {

    Container: HTMLDivElement = document.createElement("div");
    LogEntries: DownloadEntryLog[] = [];
    private statsList: StatsList = {
        list: document.createElement("ul"),
        parameters: document.createElement("li"),
        dataElemnts: document.createElement("li"),
        downloaded: {
            li: document.createElement("li"),
            countValue: document.createElement("span")},
        unavailable: {
            li: document.createElement("li"),
            countValue: document.createElement("span")},
        repaired: {
            li: document.createElement("li"),
            countValue: document.createElement("span")}};
    private JumpBackButton: HTMLButtonElement = document.createElement("button");
    private BackButton: HTMLButtonElement = document.createElement("button");
    private PlayButton: HTMLButtonElement = document.createElement("button");
    private JumpForwardButton: HTMLButtonElement = document.createElement("button");
    private slider: Slider = {
        container: document.createElement("div"),
        input: document.createElement("input"),
        currentPosition: document.createElement("span"),
        endPosition: document.createElement("span")};
    private logTable: LogTable = {
        table: document.createElement("table"),
        rows: Array(10)};
    private currentPos: number = 0;

    constructor() {
        this.createLayout();
    }

    private setCurrentPos(newPos: number) {
        this.currentPos = newPos;
        this.slider.input.valueAsNumber = newPos;
        this.slider.currentPosition.innerText = (newPos).toString();
        this.updateTable();
    }

    private updateTable() {
        var start = Math.max(0, this.currentPos - this.logTable.rows.length / 2);
        start = Math.min(start, this.LogEntries.length - this.logTable.rows.length);
        var row: LogRow;
        var logEntry: DownloadEntryLog;
        for(var i=0; i<this.logTable.rows.length; i++, start++) {
            logEntry = this.LogEntries[start];
            row = this.logTable.rows[i];
            if (start < this.currentPos) {
                row.row.style.background = "#00ff0080";
            } else {
                row.row.style.background = "#0f0f0f80";
            }
            if (logEntry.parity) {
                row.position.innerText = logEntry.left!.toString() + " -> " + logEntry.right!.toString();
            } else {
                row.position.innerText = logEntry.position.toString();
            }
            row.logPosition.innerText = start.toString();
            row.dlStatus.innerText = logEntry.downloadStatus;
            row.repStatus.innerText = logEntry.repairStatus;
        }

    }

    private createLayout() {
        var sl = this.statsList;

        sl.downloaded.li.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.GREEN) + ';">&#11044;</span>  Downloaded: ';
        sl.downloaded.li.append(sl.downloaded.countValue);


        sl.unavailable.li.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.RED) + ';">&#11044;</span>  Unavailable: ';
        sl.unavailable.li.append(sl.unavailable.countValue);

        sl.repaired.li.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.BLUE) + ';">&#11044;</span>  Repaired: ';
        sl.repaired.li.append(sl.repaired.countValue);

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
        this.slider.input.setAttribute("type", "range");
        this.slider.input.setAttribute("min", "0");
        this.slider.input.addEventListener("change", this.handleSliderChange.bind(this));
        this.slider.container.append(this.slider.input, this.slider.currentPosition, this.slider.endPosition);

        var logTableRow: LogRow;
        for(var i=0; i<this.logTable.rows.length; i++) {
            logTableRow = {
                row: document.createElement("tr"),
                logPosition: document.createElement("td"),
                dlStatus: document.createElement("td"),
                repStatus: document.createElement("td"),
                position: document.createElement("td"),
            };
            logTableRow.row.append(logTableRow.logPosition, logTableRow.position, logTableRow.dlStatus, logTableRow.repStatus, );
            this.logTable.table.append(logTableRow.row);
            this.logTable.rows[i] = logTableRow;
        }

        this.logTable.table.classList.add("log-table");

        this.Container.append(this.statsList.list, this.JumpBackButton, this.BackButton, this.PlayButton, this.JumpForwardButton, this.slider.container, this.logTable.table);
    }

    HandleUpdatedData(alpha: number, s: number, p: number, dataElements: number) {
        this.statsList.parameters.innerHTML = `(${alpha}, ${s}, ${p})`;
        this.statsList.dataElemnts.innerText = `Data Elements: ${dataElements}`;
        this.slider.input.setAttribute("max", this.LogEntries.length.toString());
        this.slider.endPosition.innerText = " / " + (this.LogEntries.length).toString();
        this.setCurrentPos(0);
        this.resetStats();
    }

    private resetStats() {
        this.statsList.downloaded.countValue.innerText = (0).toString();
        this.statsList.unavailable.countValue.innerText = (0).toString();
        this.statsList.repaired.countValue.innerText = (0).toString();
    }

    UpdateStats(downloaded: number, unavailable: number, repaired: number) {
        this.statsList.downloaded.countValue.innerText = (downloaded).toString();
        this.statsList.unavailable.countValue.innerText = (unavailable).toString();
        this.statsList.repaired.countValue.innerText = (repaired).toString();
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
        for (var count = 0; count < n && this.currentPos + count < this.LogEntries.length; count++) {
            logEntry = this.LogEntries[this.currentPos + count];
            if (logEntry.parity) {
                parityEvents.push(this.parseLogParityEvent(logEntry))
            } else {
                vertexEvents.push(this.parseLogVertexEntry(logEntry))
            }
        }
        this.setCurrentPos(this.currentPos + count);

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
        var newValue: number = this.slider.input.valueAsNumber;
        if (newValue < this.currentPos) {
            this.backClicked(this.currentPos - newValue);
        }
        else if( newValue > this.currentPos) {
            this.forwardClicked(newValue - this.currentPos);
        }
    }
}