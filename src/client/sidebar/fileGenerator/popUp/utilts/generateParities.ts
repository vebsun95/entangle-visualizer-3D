import { COLORS } from "../../../../SharedKernel/constants";
import { Parity } from "../../../../SharedKernel/interfaces";

export {GenerateParities}

function GenerateParities(alpha: number, s: number, p: number, nrdata: number, funcStrings: string[][]): Map<number, Parity>[] {
    let to: number | null, from: number | null, row: number, fncString: string;
    let fnc: Function, depth: number, parent: number, children: number[];
    let parities: Map<number, Parity>[] = Array(alpha);
    for(let i=0; i < parities.length; i++) {
        parities[i] = new Map();
    }
    for(let i=1; i<=nrdata + 5; i++) {
        for(let a=0; a<alpha; a++) {
            to = null;
            from = null;
            row = i % s;
            if(row == 1) {
                row = 0;
            } else if (row > 1) {
                row = 1;
            } else if (row == 0 ) {
                row = 2;
            }
            fncString = "return " + funcStrings[a][row] + ";"
            fncString = fncString.replace( new RegExp("i", "g"), i.toString());
            fncString = fncString.replace( new RegExp("s", "g"), s.toString());
            fncString = fncString.replace( new RegExp("p", "g"), p.toString());
            fnc = new Function(fncString);
            if(i < 129) {
                depth = 1;
                parent = 129;
                children = [];
                from = i;
                to = fnc();
            } else if (i == 129) {
                parent = 263;
                depth = 2;
                children = Array(128);
                for(let j = 1; j < 129; j++) {
                    children[j - 1] = j;
                }
            } else if( i < 258) {
                parent = 258;
                depth = 1;
                children = []
                from = i;
                to = fnc();
            } else if (i == 258) {
                parent = 263;
                depth = 2;
                children = Array(128);
                for(let j=130, k=0; k < 129; j++, k++) {
                    children[k] = j;
                }
            }  else if(i < 262) {
                parent = 262;
                depth = 1;
                children = [];
                from = i;
                to = fnc();

            } else if( i == 262) {
                parent = 263;
                depth = 2;
                children = [259, 260, 261];
            } else if (i == 263) {
                parent = 0;
                depth = 3;
                children = [129, 258, 262];
            }
            parities[a].set(i, {Index: i, Parent: parent!, Depth: depth!, Color:COLORS.GREY, Children: children!, DamagedChildren: 0, To: to, From: from})
        }
    }
    return parities;
}