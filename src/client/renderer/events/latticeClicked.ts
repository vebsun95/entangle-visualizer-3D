export {LatticeClickedEvent}

class LatticeClickedEvent extends Event {
    public static EventName: string = "lattice-clicked";
    public strand: number | null;
    public index: number | null;

    constructor(strand: number | null, index: number | null, opt: EventInit) {
        super(LatticeClickedEvent.EventName, opt)
        this.strand = strand;
        this.index = index;
    }

}
