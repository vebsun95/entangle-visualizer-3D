
import { table } from "console";
import { COLORS, DLStatus } from "./constants";
import { ParityEvent, VertexEvent } from "./interfaces";
import { convertHexToStringColor } from "./utils";

export class SideBar {

    private visible: boolean = true;
    Container: HTMLDivElement = document.createElement("div");
    PlayBackEle: PlayBack = new PlayBack();
    FileInput: FileInput = new FileInput();

    constructor() {
        document.getElementById("toggle-side-bar")?.addEventListener("click", this.toggleVisible.bind(this));

        this.createLayout();


    }

    private createLayout() {
        this.Container.id = "side-bar";
        this.Container.append(this.PlayBackEle.Container, this.FileInput.Container);
    }

    private toggleVisible() {
        if (this.visible) {
            this.Container.style.width = "1em";
        } else {
            this.Container.style.width = "";
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


    constructor() {
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
        if (this.fileRead) {
            this.readLog();
        } else {
            this.findStartPoints();
        }
    }

    private readLog() {
        var lines = ((this.fileReader.result as string)).split("\n");
        var logEntries = Array(lines.length);
        for (var [i, line] of lines.entries()) {
            logEntries[i] = JSON.parse(line);
        }
        dispatchEvent(new CustomEvent("log-changed", { detail: { newContent: logEntries } }))
    }

    private findStartPoints() {
        /* ASCII 
            \n -> 10
            {  -> 123
            -  -> 45
        */
        var buffer = new Uint8Array(this.fileReader.result as ArrayBuffer);
        var start: number | null = null, end: number = 0;


        for (let i = 0; i <= buffer.length; i++) {
            if (!start && buffer[i] == 10 && buffer[i + 1] == 123) {
                start = i + 1;
            }
            if (start && buffer[i] == 10 && buffer[i + 1] == 45) {
                end = i
                this.startPoints.push({ start: start, end: end });
                start = null;
            }
        }
        this.fileRead = true;
        dispatchEvent(new CustomEvent("new-file-upload", { detail: { fileName: this.currentFile!.name, nrOfLogs: this.startPoints.length } }))
    }

    private handleFileChange(e: InputEvent) {
        this.startPoints = [];
        this.fileRead = false;
        this.currentFile = (e.target as HTMLInputElement).files![0];
        this.fileReader.readAsArrayBuffer(this.currentFile);
    }
}

interface ChangeViewsButtons {
    container: HTMLDivElement,
    logsDD: HTMLSelectElement,
    twoDView: HTMLButtonElement,
    cylinderView: HTMLButtonElement,
    tortoisView: HTMLButtonElement,
}

interface StatsTable {
    table: HTMLTableElement,
    header: HTMLTableRowElement,
    dlRow: StatsRow,
    repRow: StatsRow,
    failedRow: StatsRow,
}


interface StatsRow {
    row: HTMLTableRowElement,
    type: HTMLTableCellElement,
    dataValue: HTMLTableCellElement,
    parityValue: HTMLTableCellElement,
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

interface Slider {
    container: HTMLDivElement,
    input: HTMLInputElement,
    currentPosition: HTMLInputElement,
    endPosition: HTMLSpanElement,
}


class PlayBack {

    Container: HTMLDivElement = document.createElement("div");
    LogEntries: (VertexEvent | ParityEvent)[] = [];
    private statsTable: StatsTable = {
        table: document.createElement("table"),
        header: document.createElement("tr"),
        dlRow: {
            row: document.createElement("tr"),
            type: document.createElement("td"),
            dataValue: document.createElement("td"),
            parityValue: document.createElement("td")},
        repRow: {
            row: document.createElement("tr"),
            type: document.createElement("td"),
            dataValue: document.createElement("td"),
            parityValue: document.createElement("td")},
        failedRow: {
            row: document.createElement("tr"),
            type: document.createElement("td"),
            dataValue: document.createElement("td"),
            parityValue: document.createElement("td")},
    }
    private JumpBackButton: HTMLButtonElement = document.createElement("button");
    private BackButton: HTMLButtonElement = document.createElement("button");
    private PlayButton: HTMLButtonElement = document.createElement("button");
    private JumpForwardButton: HTMLButtonElement = document.createElement("button");
    private slider: Slider = {
        container: document.createElement("div"),
        input: document.createElement("input"),
        currentPosition: document.createElement("input"),
        endPosition: document.createElement("span")
    };
    private logTable: LogTable = {
        table: document.createElement("table"),
        rows: Array(10)
    };
    private currentPos: number = 0;
    private changeLogDropDown: HTMLSelectElement = document.createElement("select");
    private changeButtons: ChangeViewsButtons = {
        container: document.createElement("div"),
        logsDD: document.createElement("select"),
        twoDView: document.createElement("button"),
        cylinderView: document.createElement("button"),
        tortoisView: document.createElement("button"),
    }
    private strandLabels: string[] = [];

    constructor() {
        this.createLayout();
    }

    private setCurrentPos(newPos: number) {
        this.currentPos = newPos;
        this.slider.input.valueAsNumber = newPos;
        this.slider.currentPosition.setAttribute("placeholder", (newPos).toString());
        this.slider.currentPosition.value = "";
        this.updateTable();
    }

    private updateTable() {
        var start = Math.max(0, this.currentPos - this.logTable.rows.length / 2);
        start = Math.min(start, this.LogEntries.length - this.logTable.rows.length);
        var row: LogRow;
        var logEntry: VertexEvent | ParityEvent;
        for (var i = 0; i < this.logTable.rows.length; i++, start++) {
            logEntry = this.LogEntries[start];
            row = this.logTable.rows[i];
            if (start < this.currentPos) {
                row.row.style.background = "pink";
            } else {
                row.row.style.background = "#0f0f0f80";
            }
            if ((logEntry as ParityEvent).Index) {
                logEntry as ParityEvent;
                if (!(logEntry as ParityEvent).To) {
                    row.type.innerText = "IParity";
                    row.position.innerText = "...";
                } else {
                    row.type.innerText = "Parity";
                    row.position.innerText = (logEntry as ParityEvent).From!.toString() + " -> " + (logEntry as ParityEvent).To!.toString();
                    row.position.innerText = `${this.strandLabels[(logEntry as ParityEvent).Strand + 1]}(${(logEntry as ParityEvent).From}, ${(logEntry as ParityEvent).To})`;
                }
            } else {
                row.type.innerText = "Data";
                row.position.innerText = (logEntry as VertexEvent).Position!.toString();
            }
            row.newColor.innerHTML = '<span style="color:' + convertHexToStringColor(logEntry.NewColor) + ';">&#11044;</span> '
        }

    }

    private createLayout() {
        this.changeButtons.twoDView.innerText = "2D view";
        this.changeButtons.twoDView.addEventListener("click", () => {
            dispatchEvent(new CustomEvent("change-view", {detail: { NewView: 0 }}));
        });
        this.changeButtons.cylinderView.innerText = "Cylinder View";
        this.changeButtons.cylinderView.addEventListener("click", () => {
            dispatchEvent(new CustomEvent("change-view", {detail: { NewView: 1 }}));
        });
        this.changeButtons.tortoisView.innerText = "Tortois View";
        this.changeButtons.tortoisView.addEventListener("click", () => {
            dispatchEvent(new CustomEvent("change-view", {detail: { NewView: 2 }}));
        });

        this.changeButtons.container.append(this.changeLogDropDown, this.changeButtons.twoDView, this.changeButtons.cylinderView, this.changeButtons.tortoisView);


        this.changeLogDropDown.addEventListener("change", () => {
            var value = parseInt(this.changeLogDropDown.value)
            dispatchEvent( new CustomEvent("log-changed-clicked", { detail: { changeToLog: value } }));
        });

        var sv = this.statsTable;

        var headerCell: HTMLTableCellElement = document.createElement("td");
        sv.header.append(headerCell);
        headerCell = document.createElement("td");
        headerCell.innerText = "Data";
        sv.header.append(headerCell);
        headerCell = document.createElement("td");
        headerCell.innerText = "Parity";
        sv.header.append(headerCell);

        sv.dlRow.type.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.GREEN) + ';">&#11044;</span> Downloaded: ';
        sv.dlRow.dataValue.innerHTML = "0";
        sv.dlRow.parityValue.innerHTML = "0";
        sv.dlRow.row.append(sv.dlRow.type, sv.dlRow.dataValue, sv.dlRow.parityValue);

        sv.repRow.type.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.BLUE) + ';">&#11044;</span> Repaired: ';
        sv.repRow.dataValue.innerHTML = "0";
        sv.repRow.parityValue.innerHTML = "0";
        sv.repRow.row.append(sv.repRow.type, sv.repRow.dataValue, sv.repRow.parityValue);

        sv.failedRow.type.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.RED) + ';">&#11044;</span> Unavailable: ';
        sv.failedRow.dataValue.innerHTML = "0";
        sv.failedRow.parityValue.innerHTML = "0";
        sv.failedRow.row.append(sv.failedRow.type, sv.failedRow.dataValue, sv.failedRow.parityValue);

        sv.table.append(sv.header, sv.dlRow.row, sv.repRow.row, sv.failedRow.row);

        this.JumpBackButton.innerHTML = "<<";
        this.BackButton.innerHTML = "<kbd>←</kbd>";
        this.PlayButton.innerHTML = ">";
        this.JumpForwardButton.innerHTML = ">>";

        this.JumpBackButton.addEventListener("click", () => this.backClicked(10));
        this.BackButton.addEventListener("click", () => this.backClicked(1));
        this.PlayButton.addEventListener("click", () => this.simulate(1));
        this.JumpForwardButton.addEventListener("click", () => this.simulate(10));

        this.slider.currentPosition.id = "input-currentpos"
        this.slider.currentPosition.addEventListener("change", () => {
            var value = parseInt(this.slider.currentPosition.value);
            this.handleSliderChange(value);
        });
        this.slider.input.setAttribute("type", "range");
        this.slider.input.setAttribute("min", "0");
        this.slider.input.addEventListener("change", () => this.handleSliderChange());
        this.slider.container.append(this.slider.input, this.slider.currentPosition, this.slider.endPosition);

        var logTableRow: LogRow;
        for (var i = 0; i < this.logTable.rows.length; i++) {
            logTableRow = {
                row: document.createElement("tr"),
                type: document.createElement("td"),
                newColor: document.createElement("td"),
                position: document.createElement("td"),
            };
            logTableRow.row.append(logTableRow.type, logTableRow.position, logTableRow.newColor);
            this.logTable.table.append(logTableRow.row);
            this.logTable.rows[i] = logTableRow;
        }

        this.logTable.table.classList.add("log-table");

        this.Container.append(this.changeButtons.container, this.statsTable.table, this.JumpBackButton, this.BackButton, this.PlayButton, this.JumpForwardButton, this.slider.container, this.logTable.table);
    }

    HandleUpdatedData(alpha: number, s: number, p: number, dataElements: number, logEntries: (VertexEvent | ParityEvent)[], nrOfLogs: number, strandLabels: string[]) {
        this.LogEntries = logEntries;
        this.slider.input.setAttribute("max", this.LogEntries.length.toString());
        this.slider.endPosition.innerText = " / " + (this.LogEntries.length).toString();
        this.strandLabels = ["D", ... strandLabels.map( (s) => {return s[0]} )];
        console.log(this.strandLabels)
        this.setCurrentPos(0);
        this.createChangeLogBtns(nrOfLogs);
        this.resetStats();
    }

    private createChangeLogBtns(nrOfLogs: number) {
        while (this.changeLogDropDown.children.length > 0) {
            this.changeLogDropDown.removeChild(this.changeLogDropDown.firstChild!);
        }
        var option: HTMLOptionElement;
        for(var i=0; i < nrOfLogs; i++) {
            option = document.createElement("option");
            option.innerText = "Log #" + (i+1).toString();
            option.setAttribute("value", (i).toString());
            this.changeLogDropDown.append(option);
            
        }
    }

    private resetStats() {
        this.statsTable.dlRow.dataValue.innerText = (0).toString();
        this.statsTable.failedRow.dataValue.innerText = (0).toString();
        this.statsTable.repRow.dataValue.innerText = (0).toString();
    }

    UpdateStats(downloaded: number, unavailable: number, repaired: number,parityDownload: number, parityUnavailable: number, parityRepaired: number) {
        this.statsTable.dlRow.dataValue.innerText = (downloaded).toString();
        this.statsTable.failedRow.dataValue.innerText = (unavailable).toString();
        this.statsTable.repRow.dataValue.innerText = (repaired).toString();
        this.statsTable.dlRow.parityValue.innerText = (parityDownload).toString();
        this.statsTable.failedRow.parityValue.innerText = (parityUnavailable).toString();
        this.statsTable.repRow.parityValue.innerText = (parityRepaired).toString();
    }

    private backClicked(n: number) {
        if (this.currentPos > 0) {
            var oldpos = this.currentPos;
            this.currentPos = 0;
            this.simulate(Math.max(oldpos - n, 0), true);
        }
    }

    // https://github.com/racin/entangle-visualizer/blob/master/logparser.go
    private simulate(n: number, needsReset: boolean = false) {
        if (this.currentPos > 0 || this.currentPos < this.LogEntries.length - 1) {
            var vertexEvents: VertexEvent[] = [];
            var parityEvents: ParityEvent[] = [];
            var logEntry: VertexEvent | ParityEvent;
            for (var count = 0; count < n && this.currentPos + count < this.LogEntries.length; count++) {
                logEntry = this.LogEntries[this.currentPos + count];
                if ((logEntry as ParityEvent).Index) {
                    parityEvents.push(logEntry as ParityEvent);
                } else {
                    vertexEvents.push(logEntry as VertexEvent)
                }
            }
            this.setCurrentPos(this.currentPos + count);

            dispatchEvent(new CustomEvent("logEntryEvents", { detail: { NeedsReset: needsReset, ParityEvents: parityEvents, VertexEvents: vertexEvents } }))
        }

    }

    private handleSliderChange(optValue: number | null = null) {
        var newValue: number = optValue != null ? optValue : this.slider.input.valueAsNumber;
        if (newValue < this.currentPos) {
            this.backClicked(this.currentPos - newValue);
        }
        else if (newValue > this.currentPos) {
            this.simulate(newValue - this.currentPos);
        }
    }

    public SimulateClick(n: number) {
        if (n > 0) {
            this.simulate(n);
        } else if (n < 0) {
            this.backClicked(Math.abs(n));
        }
    }

    public GetLatestEvent(): number {
        let latestEvent = this.LogEntries[this.currentPos - 1] || this.LogEntries[this.currentPos];
        return (latestEvent as VertexEvent).Position || (latestEvent as ParityEvent).From!;
    }

    public GoToStart() {
        this.backClicked(this.currentPos);
    }

    public GoToEnd() {
        this.simulate(this.LogEntries.length - this.currentPos);
    }

    public FocusInput() {
        this.slider.currentPosition.focus();
    }
}