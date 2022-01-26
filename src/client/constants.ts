export const STRANDS = {
    HStrand: 1,
    LHStrand: 2,
    RHStrand: 3,
}

export const COLORS = {
    GREEN: 0x00ff00,
    BLUE: 0x0000ff,
    RED: 0xff0000,
    GREY: 0x808080
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

export enum MOUSE {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    ROTATE = 0,
    DOLLY = 1,
    PAN = 2,
}