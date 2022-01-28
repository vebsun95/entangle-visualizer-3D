export interface Parities {
    LeftPos: number,
    RightPos: number,
    Strand: number,
    Color: number,
}

export interface Vertices {
    Label: string,
    Color: number,
    Outputs: Parities[],
}

export interface Keys {
    LEFT: string,
    UP: string,
    RIGHT: string,
    BOTTOM: string,
}

export interface MouseButtons {
    LEFT: number,
    MIDDLE: number,
    RIGHT: number,
}

export interface Touches {
    ONE: number,
    TWO: number,
}