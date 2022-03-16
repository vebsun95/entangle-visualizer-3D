export function convertHexToStringColor(hexColor: number): string {
    let hexColorString = hexColor.toString(16);
    // 0xFFFFFF
    while (hexColorString.length < 6) {
        hexColorString = '0' + hexColorString;
    }
    hexColorString = '#' + hexColorString;
    return hexColorString;
}