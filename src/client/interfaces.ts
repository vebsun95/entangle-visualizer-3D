import { Key } from "readline"

export interface Parity {
    Color: number,
    Index: number,
    Label: string,
    Adr: string,
    Depth: number,
    Parent: number,
    Children: number[],
    DamagedChildren: number[],
    To: number | null,
}

export interface Vertex {
    Color: number,
    Index: number,
    Label: string,
    Adr: string,
    Depth: number,
    Parent: number,
    Children: number[],
    DamagedChildren: number[],
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
    level: string,
    msg: string,
    type: string | null,
    log: DownloadConfigLog | TreeLayoutLog | DownloadEntryLog | DownloadSummaryLog,

}

interface dataShiftRegister {
    [Key:number]: number,
}


export interface DownloadConfigLog {
    alpha: number,
    s: number,
    p: number,
    dataElements: number,
    fileSize: number,
    parityLabels: string[]
    parityLeafIdToCanonIndex: dataShiftRegister,
    dataShiftRegister: dataShiftRegister,
    parityTreeNumChildren: Map<number, number>,
}

export interface TreeLayoutLog {
    depth: number,
    length: number,
    subTreesize: number,
    key: string,
    index: number,
    numChildren: number,
    parent: number | null,
}

export interface DownloadEntryLog {
    parity: boolean,
    position: number,
    left: number | null,
    right: number | null,
    hasData: boolean,
    downloadStatus: string,
    repairStatus: string,
    downloadStart: number,
    downloadEnd: number | null,
    repairEnd: number | null,
}

export interface DownloadSummaryLog {
    Status: string,
    totalData: number,
    totalParity: number,
    dataDL: number,
    parityDL: number,
    dataDlAndRep: number,
    DLstart: number,
    DLend: number,
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