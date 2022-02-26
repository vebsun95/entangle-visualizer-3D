export const STRANDS = {
    HStrand: 1,
    LHStrand: 3,
    RHStrand: 2,
}

export const COLORS = {
    GREEN: 0x00ff00,
    BLUE: 0x0000ff,
    RED: 0xff0000,
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