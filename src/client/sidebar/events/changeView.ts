
export {ChangeViewEvent }

class ChangeViewEvent extends Event {
    public static EventName: string = "change-view";
    public newView: number;

    constructor(newView: number, opt: EventInit) {
        super(ChangeViewEvent.EventName, opt)
        this.newView = newView;
    }

}
