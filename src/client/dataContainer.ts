import { Parities, Vertices } from "./interfaces";

export class DataContainer {
    alpha: number;
    s: number;
    p: number;
    nrOfVertices: number;
    vertices: Vertices[];

    constructor(alpha: number, s: number, p: number, vertices: Vertices[]) {
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.vertices = vertices;
        this.nrOfVertices = vertices.length;
    }
}