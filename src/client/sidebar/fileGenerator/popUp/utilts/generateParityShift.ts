export {GenerateParityShift}

function GenerateParityShift(nrdata: number): Map<number, number> {
    let parityShift: Map<number, number> = new Map();
    let shiftedP: number;
    for (let i=1; i<=nrdata; i++) {
        if(i < 129) {
            shiftedP = i;
        } else if (i == 129) {
            shiftedP = i + 1;
        } else if( i < 258) {
            shiftedP = i + 1;
        } else if (i == 258) {
            shiftedP = i+2;
        } else if (i == 259) {
            shiftedP = i+2;
        }
        parityShift.set(i, shiftedP!);
    }
    return parityShift;
}