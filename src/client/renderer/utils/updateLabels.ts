import { convertHexToStringColor } from "../../SharedKernel/utils";


export function updateLabel(newLabel: string, ctx: CanvasRenderingContext2D, backgroundColor: number, isInode: boolean) {
    let x = ctx.canvas.width / 4;
    let y = ctx.canvas.height / 2;
    let fontSize = 24;
    ctx.fillStyle = convertHexToStringColor(backgroundColor);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (isInode) {
        ctx.fillStyle = "grey";
        let width = ctx.canvas.width / 16;
        for(let i=0; i < 16; i++) {
            if(i % 2 == 0) {
                ctx.fillRect(i * width, 0, width, ctx.canvas.height);
            }
        }
    }
    ctx.font = "normal " + fontSize + "px sans-serif";
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