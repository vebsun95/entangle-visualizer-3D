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
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "normal " + fontSize + "px sarif";
    switch (backgroundColor) {
        case COLORS.GREY:
            ctx.fillStyle = convertHexToStringColor(COLORS.BLUE);
            break;
        case COLORS.GREEN:
            ctx.fillStyle = convertHexToStringColor(COLORS.RED);
            break;
        case COLORS.BLUE:
            ctx.fillStyle = convertHexToStringColor(COLORS.GREY);
            break;
        case COLORS.RED:
            ctx.fillStyle = convertHexToStringColor(COLORS.GREEN);
            break;
        default:
            ctx.fillStyle = "black";
    }
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