import { BlockEntery } from "./interfaces";

export class DataContainer {
    alpha: number;
    s: number;
    p: number;
    nrOfVertecies: number;
    parities: BlockEntery[];
    vertecies: BlockEntery[];

    constructor(alpha: number, s: number, p: number, parities: BlockEntery[], vertecies: BlockEntery[]) {
        this.alpha = alpha;
        this.s = s;
        this.p = p;
        this.parities = parities;
        this.vertecies = vertecies;
        this.nrOfVertecies = vertecies.length;
    }
}