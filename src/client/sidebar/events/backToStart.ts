
export {BackToStartEvent}

class BackToStartEvent extends Event {
    public static EventName: string = "back-to-start";

    constructor(opt: EventInit) {
        super(BackToStartEvent.EventName, opt)
    }

}
