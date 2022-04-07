
export {NewFileUploadEvent}

class NewFileUploadEvent extends Event {
    //fileName: this.currentFile!.name, nrOfLogs: this.startPoints.length
    public static EventName: string = "new-file-upload";
    public fileName: string;
    public nrOfLogs: number;

    constructor(filename: string, nrOfLogs: number, opt: EventInit) {
        super(NewFileUploadEvent.EventName, opt)
        this.fileName = filename;
        this.nrOfLogs = nrOfLogs;
    }

}
