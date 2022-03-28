import { StartPoints } from "./interfaces/interfaces";

export class FileInput {
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