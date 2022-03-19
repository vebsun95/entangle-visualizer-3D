
import { COLORS } from "./constants";
import { ParityEvent, VertexEvent } from "./interfaces";
import { convertHexToStringColor } from "./utils";

export class SideBar {

    private visible: boolean = true;
    private container: HTMLDivElement = document.getElementById("side-bar") as HTMLDivElement;
    PlayBackEle: PlayBack = new PlayBack();
    FileInput: FileInput = new FileInput();

    constructor() {
        document.getElementById("toggle-side-bar")?.addEventListener("click", this.toggleVisible.bind(this));

        this.container.append(this.PlayBackEle.Container, this.FileInput.Container);

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

interface StartPoints {
    start: number;
    end: number;
}

class FileInput {
    Container: HTMLDivElement = document.createElement("div");
    private fileInput: HTMLInputElement = document.createElement("input");
    private fileReader: FileReader = new FileReader();
    private currentFile: File | null = null;
    private fileRead: boolean = false;
    private startPoints: StartPoints[] = [];
    

    constructor () {
        this.createFileInput();
        this.fileReader.onload = this.frOnLoad.bind(this);
    }

    DevTest(devContent: string) {
        this.startPoints = [];
        this.fileRead = false;
        this.currentFile = new File([devContent], "testDev");
        this.fileReader.readAsArrayBuffer(this.currentFile);
    }

    private createFileInput() {
        this.fileInput.type = "file";
        this.fileInput.addEventListener("change", this.handleFileChange.bind(this) as EventListener)
        this.Container.append(this.fileInput);
    }

    ChangeLog(fileNumber: number) {
        if (fileNumber > this.startPoints.length) {
            return
        }
        var startpoints = this.startPoints[fileNumber];
        this.fileReader.readAsText(this.currentFile!.slice(startpoints.start, startpoints.end));
    }    

    private frOnLoad() {
        if(this.fileRead) {
            this.readLog();
        } else {
            this.findStartPoints();
        }
    }

    private readLog() {
        var lines = ((this.fileReader.result as string)).split("\n");
        var logEntries = Array(lines.length);
        for(var [i, line] of lines.entries()) {
            logEntries[i] = JSON.parse(line);
        }
        dispatchEvent( new CustomEvent("log-changed", {detail: {newContent: logEntries}}) )
    }

    private findStartPoints() {
        /* ASCII 
            \n -> 10
            {  -> 123
            -  -> 45
        */
        var buffer = new Uint8Array(this.fileReader.result as ArrayBuffer);
        var start:number | null = null, end: number = 0;

        
        for(let i=0; i<=buffer.length; i++) {
            if (!start && buffer[i] == 10 && buffer[i+1] == 123) {
                start = i + 1;
            }
            if (start && buffer[i] == 10 && buffer[i+1] == 45) {
                end = i
                this.startPoints.push({start: start, end: end});
                start = null;
            }
        }
        this.fileRead = true;
        dispatchEvent( new CustomEvent("new-file-upload", {detail : {fileName: this.currentFile!.name, nrOfLogs: this.startPoints.length}}))
    }

    private handleFileChange(e: InputEvent) {
        this.startPoints = [];
        this.fileRead = false;
        this.currentFile = (e.target as HTMLInputElement).files![0];
        this.fileReader.readAsArrayBuffer(this.currentFile);
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
    type: HTMLTableCellElement,
    position: HTMLTableCellElement,
    newColor: HTMLTableCellElement,
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
    LogEntries: (VertexEvent | ParityEvent)[] = [];
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
    private changeLogBtns: HTMLButtonElement[] = [];

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
        var logEntry: VertexEvent | ParityEvent;
        for(var i=0; i<this.logTable.rows.length; i++, start++) {
            logEntry = this.LogEntries[start];
            row = this.logTable.rows[i];
            if (start < this.currentPos) {
                row.row.style.background = "#00ff0080";
            } else {
                row.row.style.background = "#0f0f0f80";
            }
            if ( (logEntry as ParityEvent).From) {
                logEntry as ParityEvent;
                if( (logEntry as ParityEvent).To == -1 ) {
                    row.type.innerText = "Internal Parity";
                    row.position.innerText = (logEntry as ParityEvent).From.toString();
                } else {
                    row.type.innerText = "Parity Block";
                    row.position.innerText = (logEntry as ParityEvent).From.toString() + " -> " + (logEntry as ParityEvent).To.toString();
                }
            } else {
                row.type.innerText = "Data block";
                row.position.innerText = (logEntry as VertexEvent).Position!.toString();
            }
            row.newColor.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.GREEN) + ';">&#11044;</span> '
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
                type: document.createElement("td"),
                newColor: document.createElement("td"),
                position: document.createElement("td"),
            };
            logTableRow.row.append(logTableRow.type, logTableRow.position, logTableRow.newColor );
            this.logTable.table.append(logTableRow.row);
            this.logTable.rows[i] = logTableRow;
        }

        this.logTable.table.classList.add("log-table");

        this.Container.append(this.statsList.list, this.JumpBackButton, this.BackButton, this.PlayButton, this.JumpForwardButton, this.slider.container, this.logTable.table);
    }

    HandleUpdatedData(alpha: number, s: number, p: number, dataElements: number, logEntries: (VertexEvent | ParityEvent)[], nrOfLogs: number) {
        this.LogEntries = logEntries;
        this.statsList.parameters.innerHTML = `(${alpha}, ${s}, ${p})`;
        this.statsList.dataElemnts.innerText = `Data Elements: ${dataElements}`;
        this.slider.input.setAttribute("max", this.LogEntries.length.toString());
        this.slider.endPosition.innerText = " / " + (this.LogEntries.length).toString();
        this.setCurrentPos(0);
        this.resetStats();
    }

    CreateChangeLogBtns(nrOfLogs: number) {
        for(var btn of this.changeLogBtns) {
            btn.parentNode?.removeChild(btn);
        }
        this.changeLogBtns.length = nrOfLogs;
        var btn: HTMLButtonElement;
        for(let i=0; i < nrOfLogs; i++) {
            btn = document.createElement("button");
            btn.innerText = "Log #" + (i+1).toString();
            btn.addEventListener("click", () => dispatchEvent( new CustomEvent("log-changed-clicked", {detail: {changeToLog: i}}) ))
            this.changeLogBtns[i] = btn;
            this.Container.append(btn);
        }
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
        var vertexEvents: VertexEvent[] = [];
        var parityEvents: ParityEvent[] = [];
        var logEntry: VertexEvent | ParityEvent;
        for (var count = 0; count < n && this.currentPos + count < this.LogEntries.length; count++) {
            logEntry = this.LogEntries[this.currentPos + count];
            if ((logEntry as ParityEvent).From) {
                parityEvents.push(logEntry as ParityEvent);
            } else {
                vertexEvents.push(logEntry as VertexEvent)
            }
        }
        this.setCurrentPos(this.currentPos + count);

        dispatchEvent(new CustomEvent("logEntryEvents", { detail: { ParityEvents: parityEvents, VertexEvents: vertexEvents } }))
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