export {GetFuncStrings}

function GetFuncStrings(alpha: number, c: HTMLDivElement) : string[][]{
    let funcStrings: string[][] = Array(alpha);
    for (let a = 0; a < alpha; a++) {
        var strings = c.querySelectorAll(".alpha" + a);
        funcStrings[a] = [];
        funcStrings[a].push((strings[0] as HTMLInputElement).value);
        funcStrings[a].push((strings[1] as HTMLInputElement).value);
        funcStrings[a].push((strings[2] as HTMLInputElement).value);
    }
    return funcStrings;
}