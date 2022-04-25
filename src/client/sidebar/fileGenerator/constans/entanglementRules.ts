export {EntanglementRulesIn, EntanglementRulesOut}

type EntanglementFunction = (i :number, s: number, p: number) => number

const EntanglementRulesOut: EntanglementFunction[][] = [
    [
        function (i: number, s: number, p: number) {return i + s},
        function (i: number, s: number, p: number) {return i + s},
        function (i: number, s: number, p: number) {return i + s}
    ],
    [
        function (i: number, s: number, p: number) {return i + s + 1},
        function (i: number, s: number, p: number) {return i + s + 1},
        function (i: number, s: number, p: number) {return i + s * p - (s * s - 1)}
    ],
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
        function (i: number, s: number, p: number) {return i -  s* p + (s-1)*(s-1)}
    ]
]