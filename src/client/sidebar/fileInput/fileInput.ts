import { StartPoints } from "./interfaces/interfaces";

export class FileInput {
    Container: HTMLDivElement = document.createElement("div");
    private visible: boolean = true;
    private fileInput: HTMLInputElement = document.createElement("input");
    private fileGeneratorButton: HTMLButtonElement = document.createElement("button");
    private fileReader: FileReader = new FileReader();
    private currentFile: File | null = null;
    private fileRead: boolean = false;
    private startPoints: StartPoints[] = [];


    constructor() {
        this.createLayout();
        this.fileReader.onload = this.frOnLoad.bind(this);
    }

    public DevTest(devContent: string) {
        this.fileGeneratorButton.click();
        this.startPoints = [];
        this.fileRead = false;
        this.currentFile = new File([devContent], "testDev");
        //this.fileReader.readAsArrayBuffer(this.currentFile);
    }

    private createLayout() {
        this.fileInput.type = "file";
        this.fileInput.addEventListener("change", this.handleFileChange.bind(this) as EventListener);

        this.fileGeneratorButton.innerText = "Generate input file for snarl";
        this.fileGeneratorButton.addEventListener("click", () => {
            this.Container.dispatchEvent( new Event("file-generator", {bubbles: true}));
        });

        this.Container.append(this.fileInput, this.fileGeneratorButton);
    }


    public ChangeLog(fileNumber: number) {
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
        this.Container.dispatchEvent(new CustomEvent("log-changed", { detail: { newContent: logEntries }, bubbles: true }))
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
        this.Container.dispatchEvent(new CustomEvent("new-file-upload", { detail: { fileName: this.currentFile!.name, nrOfLogs: this.startPoints.length }, bubbles: true }))
    }

    private handleFileChange(e: InputEvent) {
        this.startPoints = [];
        this.fileRead = false;
        this.currentFile = (e.target as HTMLInputElement).files![0];
        this.fileReader.readAsArrayBuffer(this.currentFile);
    }

    public Hide() {
        this.visible = false;
        this.Container.style.display = "none";
    }

    public Show() {
        this.visible = true;
        this.Container.style.display = "unset";
    }

}
