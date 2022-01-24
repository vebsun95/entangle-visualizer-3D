import { RendererObject } from './renderObject'
import { BlockEntery } from './interfaces';
import { COLORS, STRANDS } from './constants';

const nrOfVertecties = 25;
const alpha = 3;
const p = 5;
const s = 5;

function readFile() {
    var vertecies: BlockEntery[] = []
    var parities: BlockEntery[] = []
    for (let i = 1; i < nrOfVertecties; i++) {
        vertecies.push(
            {
                IsParity: false,
                Position: i,
                LeftPos: -1,
                RightPos: -1,
                Strand: 0
            }
        )
    }

    for (let i = 1; i < nrOfVertecties + 1; i++) {
        let parityTo = i + s;

        // -- H Strand --
        if (parityTo <= nrOfVertecties) {
            // horizontal
            parities.push(
                {
                    IsParity: true,
                    Position: -1,
                    LeftPos: i,
                    RightPos: i + s,
                    Strand: STRANDS.HStrand
                }
            )
        }
        else if (parityTo > nrOfVertecties) {
            var right_temp = (i + s) % nrOfVertecties
            parities.push(
                {
                    IsParity: true,
                    Position: -1,
                    LeftPos: i,
                    RightPos: right_temp,
                    Strand: STRANDS.HStrand
                }
            )
        }

        // -- RH Strand --
        let helper = i % s;
        // RH Top & middle
        if (helper >= 1) {
            parityTo = i + s + 1
            if (parityTo <= nrOfVertecties) {
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: parityTo,
                        Strand: STRANDS.HStrand
                    }
                )
            }
            else if (parityTo > nrOfVertecties) {
                var right_temp = parityTo % nrOfVertecties
                if (right_temp == 0) {
                    right_temp = 1
                }
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: right_temp,
                        Strand: STRANDS.RHStrand
                    }
                )

            }
        }
        // RH Bottom
        else if (helper == 0) {
            parityTo = i + (s * p) - ((s * s) - 1)
            if (parityTo <= nrOfVertecties) {
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: parityTo,
                        Strand: STRANDS.RHStrand
                    }
                )
            }
            else if (parityTo > nrOfVertecties) {
                var right_temp = parityTo % nrOfVertecties
                if (right_temp == 0) {
                    right_temp = 1
                }
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: right_temp,
                        Strand: STRANDS.RHStrand
                    }
                )
            }
        }
        // -- LH Strand --
        if (helper == 1) {
            // top
            parityTo = i + s * p - Math.pow((s - 1), 2)
            if (parityTo <= nrOfVertecties) {
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: parityTo,
                        Strand: STRANDS.LHStrand
                    }
                )
            }
            else if (parityTo > nrOfVertecties) {
                var right_temp = parityTo % nrOfVertecties
                if (right_temp == 0) {
                    right_temp = 1
                }
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: right_temp,
                        Strand: STRANDS.LHStrand
                    }
                )
            }
        }
        else if (helper == 0 || helper > 1) {
            // central && bottom
            parityTo = i + s - 1
            if (parityTo <= nrOfVertecties) {
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: parityTo,
                        Strand: STRANDS.LHStrand
                    }
                )
            }
            else if (parityTo > nrOfVertecties) {
                var right_temp = parityTo % nrOfVertecties
                if (right_temp == 0) {
                    right_temp = 1
                }
                parities.push(
                    {
                        IsParity: true,
                        Position: -1,
                        LeftPos: i,
                        RightPos: right_temp,
                        Strand: STRANDS.LHStrand
                    }
                )
            }
        }

    }
    return { Vertecies: vertecies, Parities: parities }
}

function bitMap() {

    const colors = [
        [0,255,0],
        [255,0,0],
        [0,0,255],
        [220,220,220]
    ]

    const width = 80;
    const height = 80;
    var bitMapCanvas = <HTMLCanvasElement> document.getElementById("bitmap");
    bitMapCanvas.setAttribute("height", height.toString());
    bitMapCanvas.setAttribute("width", width.toString());
    var ctx = bitMapCanvas.getContext('2d');
    var imageData = ctx?.createImageData(width, height);
    const data = imageData?.data;

    var color 

    for (var i = 0; i < data!.length; i += 4) {
        color = colors[GetRandomColor()];
        data![i]     = color[0]  // red
        data![i + 1] = color[1];  // green
        data![i + 2] = color[2];  // blue
        data![i + 3] = 255; // blue
    }
    ctx!.putImageData(imageData!, 0, 0);
}

function GetRandomColor(): number {
    var dice = Math.random();
    if (dice < 0.7)
        return 0
    if (dice < 0.8)
        return 1
    if (dice < 0.9)
        return 2
    return 3
}

function init() {
    let data = readFile();
    const renderer = new RendererObject(3, 5, 5, data.Parities, data.Vertecies, 4);
    renderer.initObjects(1);
    renderer.createTwoDimView();
    renderer.animate();

    window.addEventListener('resize', () => renderer.onWindowRezise(), false);

    document.getElementById("btn-2d")?.addEventListener("click", () => renderer.createTwoDimView());
    document.getElementById("btn-lattice")?.addEventListener("click", () => renderer.createLattice());
    document.getElementById("btn-torus")?.addEventListener("click", () => renderer.createTorus());
}

init();

bitMap();