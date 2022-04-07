import { ParityEvent, VertexEvent } from "../../SharedKernel/interfaces";

export {LogEntryEvent }

class LogEntryEvent extends Event {
    public static EventName: string = "log-entry-events";
    public NeedsReset: boolean;
    public ParityEvents: ParityEvent[];
    public VertexEvents: VertexEvent[];

    constructor(vertexEvents: VertexEvent[], parityEvents: ParityEvent[], needsReset: boolean, opt: EventInit) {
        super(LogEntryEvent.EventName, opt)
        this.NeedsReset = needsReset;
        this.ParityEvents = parityEvents;
        this.VertexEvents = vertexEvents;
    }

}
