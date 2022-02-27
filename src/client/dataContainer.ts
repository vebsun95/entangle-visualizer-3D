import { Vertex } from "./interfaces";

export class DataContainer {
    alpha: number = 0;
    s: number = 0;
    p: number = 0;
    nrOfVertices: number = 0;
    vertices: Vertex[] = [];
    maxDepth: number = 0;

    constructor() {}

    UpdateData(alpha: number, s: number, p: number, vertices: Vertex[]) {
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.vertices = vertices;
        this.nrOfVertices = vertices.length;
        this.maxDepth = vertices[this.vertices.length - 1].Depth; // Last node in the array is always the root node.
    }
}