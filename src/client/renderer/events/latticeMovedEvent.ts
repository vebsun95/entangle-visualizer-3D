export {LaticeMovedEvent}

class LaticeMovedEvent extends Event {
    public static EventName: string = "lattice-moved";
    public position: number;

    constructor(position: number, opt: EventInit) {
        super(LaticeMovedEvent.EventName, opt)
        this.position = position;
    }

}
