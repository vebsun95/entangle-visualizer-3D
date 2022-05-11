import { LogChangedEvent } from "../events/logChangedEvent";
import { NewFileUploadEvent } from "../events/newFileUpload";
import { testLog } from "./constants/testLog";
import { StartPoints } from "./interfaces/interfaces";

export class FileInput {
    Container: HTMLDivElement = document.createElement("div");
    private visible: boolean = true;
    private fileIcon: HTMLLabelElement = document.createElement("label");
    private fileInput: HTMLInputElement = document.createElement("input");
    private fileGeneratorButton: HTMLButtonElement = document.createElement("button");
    private testFileButton: HTMLButtonElement = document.createElement("button");
    private fileReader: FileReader = new FileReader();
    private currentFile: File | null = null;
    private fileRead: boolean = false;
    private startPoints: StartPoints[] = [];


    constructor() {
        this.createLayout();
        this.fileReader.onload = this.frOnLoad.bind(this);
    }

    private handleTestFileBtn() {
        this.startPoints = [];
        this.fileRead = false;
        this.currentFile = new File([testLog], "Test log");
        this.fileReader.readAsArrayBuffer(this.currentFile);
    }

    private createLayout() {
        let header = document.createElement("h1");
        header.innerText = "Entangle visualizer 3D";
        this.fileInput.type = "file";
        this.fileInput.addEventListener("change", this.handleFileChange.bind(this) as EventListener);

        this.fileGeneratorButton.innerText = "Generate input file for snarl";
        this.fileGeneratorButton.addEventListener("click", () => {
            this.Container.dispatchEvent( new Event("file-generator", {bubbles: true}));
        });

        this.fileInput.id = "input";
        this.fileIcon.htmlFor = "input";
        this.fileIcon.innerHTML = '<i class="fa fa-upload"></i>';

        this.testFileButton.innerText = "Test log";
        this.testFileButton.onclick = this.handleTestFileBtn.bind(this);

        this.Container.append(header, this.fileInput, this.fileGeneratorButton, this.fileIcon, this.fileInput, this.testFileButton);
    }

    // Exposed method used to read a specified log.
    public ChangeLog(fileNumber: number) {
        if (fileNumber > this.startPoints.length) {
            return
        }
        var startpoints = this.startPoints[fileNumber];
        this.fileReader.readAsText(this.currentFile!.slice(startpoints.start, startpoints.end));
    }

    // Triggers when fileReader complets reading a file, or parts of a file
    private frOnLoad() {
        if (this.fileRead) {
            this.readLog();
        } else {
            this.findStartPoints();
        }
    }

    // Gets called when fileRead = true
    // fileReader.result only contains a subset of the uploaded file = one, of the possible multiple, logs contained in a file.
    private readLog() {
        var lines = ((this.fileReader.result as string)).split("\n");
        var logEntries = Array(lines.length);
        for (var [i, line] of lines.entries()) {
            logEntries[i] = JSON.parse(line);
        }
        this.Container.dispatchEvent(new LogChangedEvent( logEntries, {bubbles: true} ))
    }

    // Gets called when fileRead = false
    // Used to locate the start- and end position of different logs in an uploaded file.
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
        this.Container.dispatchEvent( new NewFileUploadEvent(this.currentFile!.name, this.startPoints.length, {bubbles: true}) )
    }

    // Gets triggered when a new file is uploaded
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
