export interface ChangeViewsButtons {
    container: HTMLDivElement,
    logsDD: HTMLSelectElement,
    twoDView: HTMLButtonElement,
    cylinderView: HTMLButtonElement,
    tortoisView: HTMLButtonElement,
}

export interface StatsTable {
    table: HTMLTableElement,
    config: HTMLParagraphElement,
    fileName: HTMLParagraphElement,
    header: HTMLTableRowElement,
    dlRow: StatsRow,
    repRow: StatsRow,
    failedRow: StatsRow,
    failedRepRow: StatsRow,
}

export interface StatsRow {
    row: HTMLTableRowElement,
    type: HTMLTableCellElement,
    dataCell: HTMLTableCellElement,
    parityCell: HTMLTableCellElement,
}

export interface LogTable {
    table: HTMLTableElement,
    rows: LogRow[],
}

export interface LogRow {
    row: HTMLTableRowElement,
    type: HTMLTableCellElement,
    position: HTMLTableCellElement,
    newColor: HTMLTableCellElement,
}

export interface Slider {
    container: HTMLDivElement,
    input: HTMLInputElement,
    currentPosition: HTMLInputElement,
    endPosition: HTMLSpanElement,
}