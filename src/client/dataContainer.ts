import { Vertex } from "./interfaces";

export class DataContainer {
    alpha: number = 0;
    s: number = 0;
    p: number = 0;
    nrOfVertices: number = 0;
    vertices: Vertex[] = [];

    constructor() {}

    UpdateData(alpha: number, s: number, p: number, vertices: Vertex[]) {
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.vertices = vertices;
        this.nrOfVertices = vertices.length;
    }
}