import { Vertices } from "./interfaces";

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
    GetInternalNodes(StartIndex: number, EndIndex: number) :number[]{
        var res = []
        for(;StartIndex < EndIndex; StartIndex++) {
            if(this.vertices[StartIndex].Depth == 2) {
                res.push(StartIndex);
            }
        }
        return res;
    }

}