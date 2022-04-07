
export {LogChangedEvent}

class LogChangedEvent extends Event {
    //fileName: this.currentFile!.name, nrOfLogs: this.startPoints.length
    public static EventName: string = "log-changed";
    public newContent: any[];

    constructor(newContent: any[], opt: EventInit) {
        super(LogChangedEvent.EventName, opt)
        this.newContent = newContent;
    }

}
