import { Color } from "three";
import { COLORS } from "../../SharedKernel/constants";
import { convertHexToStringColor } from "../../SharedKernel/utils";


export function updateLabel(newLabel: string, ctx: CanvasRenderingContext2D, backgroundColor: number, isInode: boolean) {
    let x = ctx.canvas.width / 4;
    let y = ctx.canvas.height / 2;
    let fontSize = 24;
    if (isInode) {
        x *= 2;
        fontSize *= 2;
    }
    ctx.fillStyle = convertHexToStringColor(backgroundColor);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "normal " + fontSize + "px sarif";
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    if (newLabel.length > 4) {
        let l = newLabel.length
        ctx.fillText(newLabel.slice(0, l - 3), x, y - fontSize / 2);
        ctx.fillText(newLabel.slice(l - 3, l), x, y + fontSize / 2);

    } else {
        ctx.fillText(newLabel, x, y);
    }
}