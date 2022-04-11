import { COLORS } from "../../../../SharedKernel/constants";
import { Vertex } from "../../../../SharedKernel/interfaces";

export {GenerateVertices}

function GenerateVertices(nrdata: number) : Map<number, Vertex> {
    let vertices: Map<number, Vertex> = new Map();
    let depth: number = 1, parent: number = 0, children: number[] = []
    for (let i=1; i<=nrdata; i++) {
        vertices.set(i, {Index: i, Children: children, Color: COLORS.GREY, Depth: depth, Parent:parent, DamagedChildren: 0 });
    }
    return vertices;
}