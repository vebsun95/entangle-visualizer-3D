import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

export class BitMap extends DataContainer {

    canvas: HTMLCanvasElement;
    container: HTMLDivElement;

    constructor(alpha: number, s: number, p: number, vertecies: Vertices[]) {
        super(alpha, s, p, vertecies);
        this.container = document.getElementById("bitmap-container") as HTMLDivElement;
        this.canvas = document.getElementById("bitmap") as HTMLCanvasElement;
        this.canvas.setAttribute("width", "100%")
        this.canvas.setAttribute("height", "100%")
    }

    Draw() {

        const colors = [
            [0, 255, 0],
            [255, 0, 0],
            [0, 0, 255],
            [220, 220, 220]
        ]
        var ctx = this.canvas.getContext('2d');
        var imageData = ctx?.createImageData(1368, 43);
        const data = imageData?.data;
        var color
        console.log(data?.length);

        for (var i = 0; i < data!.length; i += 4) {
            color = colors[this.GetRandomColor()];
            data![i] = color[0];      // red
            data![i + 1] = color[1];  // green
            data![i + 2] = color[2];  // blue
            data![i + 3] = 255;       // alpha
        }
        ctx!.putImageData(imageData!, 0, 0);
    }

    GetRandomColor(): number {
        var dice = Math.random();
        if (dice < 0.7)
            return 0
        if (dice < 0.8)
            return 1
        if (dice < 0.9)
            return 0
        return 3
    }


}
