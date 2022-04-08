export const STRANDS = {
    HStrand: 0,
    LHStrand: 2,
    RHStrand: 1,
}

export const COLORS = {
    GREEN: 0x9eff69,
    BLUE: 0x3c96ff,
    RED: 0xff4646,
    YELLOW: 0xfcba03,
    GREY: 0xd1d1d1
}

export const STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
};

export const MSG = {
    DlConfig: "Download Config",
    TreeLayout: "Tree Layout",
    DlEntry: "Download Entry",
    DlSummary: "Download Summary",
    ParityTreeEntry: "Parity Tree Download Entry",
}

export const DLStatus = {
    Success: "DownloadSuccess",
    Pending: "DownloadPending",
    Failed: "DownloadFailed",
}

export const RepStatus = {
    NoRep: "NoRepair",
    Success: "RepairSuccess",
    Pending: "RepairPending",
    Failed: "RepairFailed",
}

export enum MOUSE {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    ROTATE = 0,
    DOLLY = 1,
    PAN = 2,
}

export enum DIRECTIONS {
    LEFT,
    RIGHT,

}