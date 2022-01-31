import { RendererObject } from './renderObject'
import { Vertices, Parities } from './interfaces';
import { COLORS, STRANDS } from './constants';
import { BitMap } from './bitmap';

const nrOfVertices = 25000;
const alpha = 3;
const s = 5;
const p = s;

var renderer: RendererObject;
var bitmapObj: BitMap;

function readFile() {
    var vertices: Vertices[] = [];
    
    for (let i = 1; i < nrOfVertices + 1; i++) {
        vertices.push(
            {
                Label: i.toString(),
                Color: GetRandomColorString(),
                Outputs: [],
            }
        )
        for (let j = 1; j < 2; j++) {
            let parityTo = i + s;
    
            // -- H Strand --
            if (parityTo <= nrOfVertices) {
                // horizontal
                vertices[vertices.length - 1].Outputs.push(
                    {
                        LeftPos: i,
                        RightPos: i + s,
                        Strand: STRANDS.HStrand,
                        Color: COLORS.BLUE,
                    }
                )
            }
            else if (parityTo > nrOfVertices) {
                var right_temp = (i + s) % nrOfVertices
                vertices[vertices.length - 1].Outputs.push(
                    {
                        LeftPos: i,
                        RightPos: right_temp,
                        Strand: STRANDS.HStrand,
                        Color: COLORS.BLUE,
                    }
                )
            }
    
            // -- RH Strand --
            let helper = i % s;
            // RH Top & middle
            if (helper >= 1) {
                parityTo = i + s + 1
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
    
                }
            }
            // RH Bottom
            else if (helper == 0) {
                parityTo = i + (s * p) - ((s * s) - 1)
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
            }
            // -- LH Strand --
            if (helper == 1) {
                // top
                parityTo = i + s * p - Math.pow((s - 1), 2)
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
            }
            else if (helper == 0 || helper > 1) {
                // central && bottom
                parityTo = i + s - 1
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
    
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
            }
    
        }
    }

    
    return vertices;
}

function GetRandomColorString(): number {
    var dice = Math.random();
    if (dice < 0.99)
        return COLORS.GREEN
    return COLORS.RED
}

function init() {
    let data = readFile();
    renderer = new RendererObject(alpha, s, p, data, 4);
    renderer.initObjects();
    renderer.createTwoDimView();
    renderer.animate();

    bitmapObj = new BitMap(alpha, s, p, data);
    bitmapObj.Draw();

    window.addEventListener('resize', () => renderer.onWindowResize(), false);

    document.getElementById("btn-2d")?.addEventListener("click", () => renderer.createTwoDimView());
    document.getElementById("btn-lattice")?.addEventListener("click", () => renderer.createLattice());
    document.getElementById("btn-torus")?.addEventListener("click", () => renderer.createTorus());
    document.getElementById("bitmap-container")?.addEventListener("click", (event: MouseEvent) => {
        let index = bitmapObj.GetIndexFromCoord(event.offsetX, event.offsetY);
        renderer.GoTo(index);
    })
}

init();