export interface Parity {
    LeftPos: number,
    RightPos: number,
    Strand: number,
    Color: number,
    Fetched: boolean,
}

export interface Vertex {
    Addr: string,
    Label: string,
    Color: number,
    Outputs: Parity[],
    Index: number,
    Depth: number,
    Parent: number,
    Replication: number,
    Children: number[],
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

export interface ContentJSON {
    config: ConfigJSON
    dataTree: VertexJSON[],
    parityTrees: ParityJSON[][],
    Log: LogEntryJSON,
}

export interface ConfigJSON {
    alpha: number,
    s: number,
    p: number,
    dataElements: number,
    fileSize: number,
    parityLabels: string[]
}

export interface VertexJSON {
    addr: string,
    index: number,
    depth: number,
    replication: number,
    parent: number,
}

export interface ParityJSON {
    addr: string,
    latticeIndex: number,
    index: number,
    depth: number,
    replication: number,
    parent: number,
    to: number,
}

export interface LogEntryJSON {
    parity: boolean,
    index: number,
    hasData: boolean,
    downloadStart: number,
    downloadEnd: number | null,
    repairStart: number | null,
    repairEnd: number | null,
    downloadStatus: string
    repairStatus: string,
}