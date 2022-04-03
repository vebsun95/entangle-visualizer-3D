import { COLORS } from "../../../../SharedKernel/constants";
import { Vertex } from "../../../../SharedKernel/interfaces";

export {GenerateVertices}

function GenerateVertices(nrdata: number) : Map<number, Vertex> {
    let vertices: Map<number, Vertex> = new Map();
    let depth: number, parent: number, children: number[]
    for (let i=1; i<=nrdata; i++) {
        if(i < 129) {
            depth = 1;
            parent = 129;
            children = [];
        } else if (i == 129) {
            parent = 259;
            depth = 2;
            children = Array(128);
            for(let j = 1; j < 129; j++) {
                children[j - 1] = j;
            }
        } else if( i < 258) {
            parent = 258;
            depth = 1;
            children = []
        } else if (i == 258) {
            parent = 259;
            depth = 2;
            children = Array(128);
            for(let j=130, k=0; k < 128; j++, k++) {
                children[k] = j;
            }
        } else if (i == 259) {
            parent = 0;
            depth = 3;
            children = [129, 258];
        }
        vertices.set(i, {Index: i, Children: children!, Color: COLORS.GREY, Depth: depth!, Parent: parent!, DamagedChildren: 0 });
    }
    return vertices;
}