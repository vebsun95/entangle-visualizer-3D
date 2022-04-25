import { COLORS, DLStatus, RepStatus } from "./constants";
import { DownloadEntryLog } from "./interfaces";

export {ParseLogEntry}

function ParseLogEntry(logEntry: DownloadEntryLog): number {

    if (logEntry.downloadStatus === DLStatus.Failed && logEntry.repairStatus == RepStatus.NoRep && !logEntry.hasData) {
        return COLORS.RED;
    }
    else if (logEntry.downloadStatus === DLStatus.Failed && logEntry.repairStatus == RepStatus.Failed && !logEntry.hasData) {
        return COLORS.YELLOW;
    }
    else if (logEntry.repairStatus === RepStatus.Success && logEntry.hasData) {
        return COLORS.BLUE
    }
    return COLORS.GREEN;
}