
export {LogChangedClickedEvent}

class LogChangedClickedEvent extends Event {
    public static EventName: string = "log-changed-clicked";
    public changeToLog: number;

    constructor(changeToLog: number, opt: EventInit) {
        super(LogChangedClickedEvent.EventName, opt)
        this.changeToLog = changeToLog;
    }

}
