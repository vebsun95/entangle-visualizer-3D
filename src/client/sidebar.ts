
import { COLORS } from "./constants";
import { DownloadConfigLog, ParityEvent, VertexEvent } from "./interfaces";
import { convertHexToStringColor } from "./utils";

export class SideBar {

    private visible: boolean = true;
    Container: HTMLDivElement = document.createElement("div");
    PlayBackEle: PlayBack = new PlayBack();
    FileInput: FileInput = new FileInput();

    constructor() {
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
    config: HTMLTableRowElement,
    fileName: HTMLTableRowElement,
    header: HTMLTableRowElement,
    dlRow: StatsRow,
    repRow: StatsRow,
    failedRow: StatsRow,
}

interface StatsRow {
    row: HTMLTableRowElement,
    type: HTMLTableCellElement,
    dataCell: HTMLTableCellElement,
    parityCell: HTMLTableCellElement,
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

    public Container: HTMLDivElement = document.createElement("div");
    public LogEntries: (VertexEvent | ParityEvent)[] = [];
    private statsTable: StatsTable = {
        table: document.createElement("table"),
        config: document.createElement("tr"),
        fileName: document.createElement("tr"),
        header: document.createElement("tr"),
        dlRow: {
            row: document.createElement("tr"),
            type: document.createElement("td"),
            dataCell: document.createElement("td"),
            parityCell: document.createElement("td")},
        repRow: {
            row: document.createElement("tr"),
            type: document.createElement("td"),
            dataCell: document.createElement("td"),
            parityCell: document.createElement("td")},
        failedRow: {
            row: document.createElement("tr"),
            type: document.createElement("td"),
            dataCell: document.createElement("td"),
            parityCell: document.createElement("td")},
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

        var st = this.statsTable;
        st.table.classList.add("stats-table")

        var headerCell: HTMLTableCellElement = document.createElement("td");
        st.header.append(headerCell);
        headerCell = document.createElement("td");
        headerCell.innerText = "Data";
        st.header.append(headerCell);
        headerCell = document.createElement("td");
        headerCell.innerText = "Parity";
        st.header.append(headerCell);

        st.dlRow.type.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.GREEN) + ';">&#11044;</span> Downloaded: ';
        st.dlRow.dataCell.innerHTML = "0";
        st.dlRow.parityCell.innerHTML = "0";
        st.dlRow.row.append(st.dlRow.type, st.dlRow.dataCell, st.dlRow.parityCell);

        st.repRow.type.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.BLUE) + ';">&#11044;</span> Repaired: ';
        st.repRow.dataCell.innerHTML = "0";
        st.repRow.parityCell.innerHTML = "0";
        st.repRow.row.append(st.repRow.type, st.repRow.dataCell, st.repRow.parityCell);

        st.failedRow.type.innerHTML = '<span style="color:' + convertHexToStringColor(COLORS.RED) + ';">&#11044;</span> Unavailable: ';
        st.failedRow.dataCell.innerHTML = "0";
        st.failedRow.parityCell.innerHTML = "0";
        st.failedRow.row.append(st.failedRow.type, st.failedRow.dataCell, st.failedRow.parityCell);

        st.table.append(st.fileName, st.config, st.header, st.dlRow.row, st.repRow.row, st.failedRow.row);

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

    public HandleUpdatedData(alpha: number, s: number, p: number) {
        this.slider.input.setAttribute("max", this.LogEntries.length.toString());
        this.slider.endPosition.innerText = " / " + (this.LogEntries.length).toString();
        this.setCurrentPos(0);
        this.resetStats();
    }

    public CreateChangeLogBtns(nrOfLogs: number) {
        // Delete the old buttons
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
        this.NrOfDataDl = 0;
        this.NrOfDataRep = 0;
        this.NrOfDataUna = 0;
        this.NrOfParityDl = 0;
        this.NrOfParityRep = 0;
        this.NrOfParityUna = 0;
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
    public set StrandLabels(newLabels: string[]) {
        this.strandLabels = ["D", ... newLabels.map( (s) => {return s[0]} )];
    }

    public set Filename (newFilename: string) {
        this.statsTable.fileName.innerText = newFilename;
    }

    public set Config (newConfig: DownloadConfigLog) {
        this.statsTable.config.innerText = `(${newConfig.alpha}, ${newConfig.s}, ${newConfig.p})\t #${newConfig.dataElements}`
    }

    // DATA Download
    public set NrOfDataDl(value: number) {
        this.statsTable.dlRow.dataCell.innerText = value.toString();
    }
    
    public get NrOfDataDl(): number {
        return parseInt(this.statsTable.dlRow.dataCell.innerText)
    }
    // ----
    
    // DATA Repaired
    public set NrOfDataRep(value: number) {
        this.statsTable.repRow.dataCell.innerText = value.toString();
    }
    
    public get NrOfDataRep(): number {
        return parseInt(this.statsTable.repRow.dataCell.innerText)
    }
    // ----

    // DATA Unavailable
    public set NrOfDataUna(value: number) {
        this.statsTable.failedRow.dataCell.innerText = value.toString();
    }
    
    public get NrOfDataUna(): number {
        return parseInt(this.statsTable.failedRow.dataCell.innerText)
    }
    // -----

    // Parity Download
    public set NrOfParityDl(value: number) {
        this.statsTable.dlRow.parityCell.innerText = value.toString();
    }
    
    public get NrOfParityDl(): number {
        return parseInt(this.statsTable.dlRow.parityCell.innerText)
    }
    // ----
    
    // Parity Repaired
    public set NrOfParityRep(value: number) {
        this.statsTable.repRow.parityCell.innerText = value.toString();
    }
    
    public get NrOfParityRep(): number {
        return parseInt(this.statsTable.repRow.parityCell.innerText)
    }
    // ----

    // Parity Unavailable
    public set NrOfParityUna(value: number) {
        this.statsTable.failedRow.parityCell.innerText = value.toString();
    }
    
    public get NrOfParityUna(): number {
        return parseInt(this.statsTable.failedRow.parityCell.innerText)
    }
    // ----
}