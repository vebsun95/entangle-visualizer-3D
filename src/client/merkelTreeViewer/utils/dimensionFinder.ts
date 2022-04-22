export {DimensionFinder}

function DimensionFinder(nrOfChildren: number): [number, number] {
    // Check if nrOfChildren is a prime and increase nrOfChildren by 1 if prime
    if (PrimeCheck(nrOfChildren) && nrOfChildren > 5) {
        nrOfChildren++
        //nrOfRows = Math.floor((2 / 3) * Math.sqrt(nrOfChildren)) || 1; 
        //nrOfColumns = Math.ceil(nrOfChildren / nrOfRows);
    }
    // If not prime know the product of two numbers will give nrOfChildren
    let combo: [number, number];
    let listCombinations = []
    listCombinations.push([1, nrOfChildren]);
    for (let i = 2; i < nrOfChildren; i++) {                            // https://www.brilliant.org/bartek_stasiak;
        if (Number.isInteger(nrOfChildren / i)) {
            combo = [i, nrOfChildren / i]
            if (listCombinations[listCombinations.length - 1][1] == i) {
                break
            }
            listCombinations.push(combo)
        }
    }
    return [listCombinations[listCombinations.length - 1][0], listCombinations[listCombinations.length - 1][1]];
}

function PrimeCheck(n: number): boolean {
    if (n < 4) {
        return true;
    }
    for (let x = 2; x < n; x++) {
        if (n % x == 0) {
            return false;
        }
    }
    return true;
}