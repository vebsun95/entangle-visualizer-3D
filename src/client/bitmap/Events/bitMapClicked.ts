export {BitMapClickedEvent}

class BitMapClickedEvent extends Event {
    public VertexIndex: number;
    public static EventName: string = "bitmap-clicked";

    constructor(opt: EventInit, vertexIndex: number) {
        super(BitMapClickedEvent.EventName, opt)
        this.VertexIndex = vertexIndex;
    }

}
