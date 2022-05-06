import { COLORS } from "../../../../SharedKernel/constants";
import { Parity } from "../../../../SharedKernel/interfaces";
import { EntanglementRulesIn, EntanglementRulesOut } from "../../constans/entanglementRules";

export { GenerateParities }

function GenerateParities(alpha: number, s: number, p: number, nrData: number): Map<number, Parity>[] {
    let to: number | null, from: number | null, row: number;
    let fnc: Function, depth: number = 1, parent: number = 0, children: number[] = [];
    let parities: Map<number, Parity>[] = Array(alpha);
    let fromParity, input: number;
    for (let i = 0; i < parities.length; i++) {
        parities[i] = new Map();
    }
    for (let i = 1; i <= nrData; i++) {
        for (let a = 0; a < alpha; a++) {
            to = null;
            from = null;
            row = i % s;
            if (row == 1) {
                row = 0;
            } else if (row > 1) {
                row = 1;
            } else if (row == 0) {
                row = 2;
            }
            fnc = EntanglementRulesOut[a][row];
            from = i;
            to = fnc(i, s, p);
            parities[a].set(i, { Index: i, Parent: parent!, Depth: depth!, Color: COLORS.GREY, Children: children!, DamagedChildren: 0, To: to, From: from })
        }
    }
    // Compute the closing of the lattice on parities where the to object > nrData.
    // https://github.com/relab/snarl-mw21/blob/main/entangler/entangler.go
    // Row 0 -> Top, 1 -> Central, 2 -> Bottom
    for (let i = Math.max( nrData - (s*2 - 1), 0); i <= nrData; i++) {
        for (let a = 0; a < alpha; a++) {
            fromParity = parities[a].get(i)!;
            input = i;
            if (fromParity.To! <= nrData) continue;

            // Calculate the postion in the LW.
            input = i % (s * p);
            if (input == 0) input = s * p;

            while (input > s) {
                row = input % s;
                // Top
                if (row == 1) {
                    row = 0;
                } // Bottom 
                else if (row == 0) {
                    row = 2;
                } // Central
                else {
                    row = 1;
                }
                fnc = EntanglementRulesIn[a][row];
                input = fnc(input, s, p);
            }
            fromParity.To = input;
        }
    }
    return parities;
}