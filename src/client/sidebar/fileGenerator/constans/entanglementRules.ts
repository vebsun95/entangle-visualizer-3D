export {EntanglementRulesIn, EntanglementRulesOut}

type EntanglementFunction = (i :number, s: number, p: number) => number

/*
    Entanglement rules follows this structure
    [alpha][Top, Central, Bottom]
    i.e. to get Right hand top output => EntanglementRulesOut[1][0](index, s, p)
*/
const EntanglementRulesOut: EntanglementFunction[][] = [
    // Horizontal
    [
        // Top
        function (i: number, s: number, p: number) {return i + s},
        // Central
        function (i: number, s: number, p: number) {return i + s},
        // Bottom
        function (i: number, s: number, p: number) {return i + s}
    ],
    // Right-Hand
    [
        function (i: number, s: number, p: number) {return i + s + 1},
        function (i: number, s: number, p: number) {return i + s + 1},
        function (i: number, s: number, p: number) {return i + s * p - (s * s - 1)}
    ],
    // Left Hand
    [
        function (i: number, s: number, p: number) {return i + s * p - (s - 1)*(s - 1)},
        function (i: number, s: number, p: number) {return i + s - 1},
        function (i: number, s: number, p: number) {return i + s - 1}
    ]
]

const EntanglementRulesIn: EntanglementFunction[][] = [
    [
        function (i: number, s: number, p: number) {return i - s},
        function (i: number, s: number, p: number) {return i - s},
        function (i: number, s: number, p: number) {return i - s}
    ],
    [
        function (i: number, s: number, p: number) {return i - s * p + (s*s - 1)},
        function (i: number, s: number, p: number) {return i - (s + 1)},
        function (i: number, s: number, p: number) {return i - (s + 1)}
    ],
    [
        function (i: number, s: number, p: number) {return i - (s - 1)},
        function (i: number, s: number, p: number) {return i - (s - 1)},
        function (i: number, s: number, p: number) {return i -  s * p +  Math.pow(s-1, 2)}
    ]
]