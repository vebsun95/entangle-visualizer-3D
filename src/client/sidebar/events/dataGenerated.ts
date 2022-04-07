import { Parity, Vertex } from "../../SharedKernel/interfaces";

export {DataGeneratedEvent}

class DataGeneratedEvent extends Event {
    public static EventName: string = "data-generated";
    public vertices: Map<number, Vertex>;
    public alpha: number;
    public s: number;
    public p:number;
    public parities: Map<number, Parity>[];
    public parityShift: Map<number, number>;

    constructor(vertices: Map<number, Vertex>, alpha: number, s: number, p:number, parities: Map<number, Parity>[], parityShift: Map<number, number>, opt: EventInit) {
        super(DataGeneratedEvent.EventName, opt)
        this.vertices = vertices;
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.parities = parities;
        this.parityShift = parityShift;
    }

}
