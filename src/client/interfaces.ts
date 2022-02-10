export interface Parities {
    LeftPos: number,
    RightPos: number,
    Strand: number,
    Color: number,
    Fetched: boolean,
}

export interface Vertices {
    Addr: string,
    Label: string,
    Color: number,
    Outputs: Parities[],
    Index: number,
    Depth: number,
    Parent: number,
    Replication: number,
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