import { Parity, Vertex } from "./interfaces";
import { ParityShiftMock } from "./parityShiftMock";

export abstract class DataContainer {
    alpha: number = 0;
    s: number = 0;
    p: number = 0;
    nrOfVertices: number = 0;
    vertices: Map<number, Vertex> = new Map();
    parities: Map<number, Parity>[] = [];
    parityShift: Map<number, number> | ParityShiftMock = new Map();
    maxDepth: number = 0;

    constructor() {}

    public UpdateData(alpha: number, s: number, p: number, vertices: Map<number, Vertex>, parities: Map<number, Parity>[], parityShift: Map<number, number>) {
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.vertices = vertices;
        this.parities = parities;
        this.nrOfVertices = this.vertices.size;
        this.maxDepth = vertices.get(this.nrOfVertices)!.Depth; // Last node in the array is always the root node.
        this.parityShift = parityShift;
    }

    public abstract HandleUpdatedData(): void;

    public abstract Update(): void;

}