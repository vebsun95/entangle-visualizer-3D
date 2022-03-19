import { COLORS, DLStatus, RepStatus } from "./constants";
import { DownloadEntryLog, ParityEvent, VertexEvent } from "./interfaces";

export function convertHexToStringColor(hexColor: number): string {
    let hexColorString = hexColor.toString(16);
    // 0xFFFFFF
    while (hexColorString.length < 6) {
        hexColorString = '0' + hexColorString;
    }
    hexColorString = '#' + hexColorString;
    return hexColorString;
}

export function parseLogVertexEntry(logEntry: DownloadEntryLog): VertexEvent {
    if (logEntry.downloadStatus === DLStatus.Failed && !logEntry.hasData) {
        return { Position: logEntry.position!, NewColor: COLORS.RED }
    }
    else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
        return { Position: logEntry.position!, NewColor: COLORS.BLUE }
    }
    //else if (logEntry.downloadStatus === DLStatus.Success) {
    return { Position: logEntry.position!, NewColor: COLORS.GREEN }
}

export function parseLogParityEvent(logEntry: DownloadEntryLog, strand: number): ParityEvent {
    if (logEntry.downloadStatus === DLStatus.Failed && !logEntry.hasData) {
        return { From: logEntry.start!, To: logEntry.end!, NewColor: COLORS.RED, Strand: strand }
    }
    else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
        return { From: logEntry.start!, To: logEntry.end!, NewColor: COLORS.BLUE, Strand: strand }

    }
    //else if (logEntry.downloadStatus === DLStatus.Success) {
    return { From: logEntry.start!, To: logEntry.end!, NewColor: COLORS.GREEN, Strand: strand }
}