import { Parities, Vertices } from "./interfaces";

export class DataContainer {
    alpha: number;
    s: number;
    p: number;
    nrOfVertices: number;
    parities: Parities[];
    vertices: Vertices[];

    constructor(alpha: number, s: number, p: number, parities: Parities[], vertices: Vertices[]) {
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.parities = parities;
        this.vertices = vertices;
        this.nrOfVertices = vertices.length;
    }
}