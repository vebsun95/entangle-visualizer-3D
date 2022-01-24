import * as THREE from 'three'
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RendererObject } from './renderObject'
import { BlockEntery } from './interfaces';

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 53;

var strandMapping: { [id: string]: number } = {}

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const nrOfVertecties = 25;
const alpha = 3;
const p = 5;
const s = 5;

const horizontal = 1;
const LHStrand = 2;
const RHStrand = 3;

var group = new THREE.Group()



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
                    Strand: horizontal
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
                    Strand: horizontal
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
                        Strand: RHStrand
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
                        Strand: RHStrand
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
                        Strand: RHStrand
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
                        Strand: RHStrand
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
                        Strand: LHStrand
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
                        Strand: LHStrand
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
                        Strand: LHStrand
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
                        Strand: LHStrand
                    }
                )
            }
        }

    }
    return { Vertecies: vertecies, Parities: parities }
}


function initObjects() {
    const radius = 1;

    const geometry = new THREE.SphereGeometry(radius);
    var counter: number;
    var obj: THREE.Mesh;
    var material: THREE.MeshBasicMaterial;

    for (let i = 1; i <= s; i++) {
        counter = i
        for (let pos = 1; pos <= (nrOfVertecties / s); pos++) {

            material = new THREE.MeshBasicMaterial({
                map: createTexture(counter.toString(), radius * 50),
            });
            obj = new THREE.Mesh(geometry, material);
            obj.name = counter.toString();
            
            group.add(obj);

            counter += s;
        }
    }

    scene.add(group);

    var name: string;
    const parities: BlockEntery[] = readFile().Parities;
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf0ff0 });

    parities.forEach(parity => {

        // Hver linje har 4 punkter, som tar 3 plasser(x, y, z)
        var positions = new Float32Array(4 * 3);

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const curveObject = new THREE.Line(lineGeometry, lineMaterial);
        name = parity.LeftPos + "_" + parity.RightPos;
        curveObject.name = name;
        strandMapping.name = parity.Strand;
        scene.add(curveObject);
        curveObject.geometry.attributes.position.needsUpdate;
    });
}

function createLattice() {

    var counter: number;
    var piParts: number = (2 * Math.PI) / Math.ceil(nrOfVertecties / s);
    const scale: number = 10;

    for (let i = 1; i <= s; i++) {
        counter = i
        for (let pos = 0; pos < 2 * Math.PI; pos += piParts) {
            var obj = scene.getObjectByName(counter.toString())
            if (typeof obj != undefined) {
                obj?.position.set(
                    scale * Math.cos(pos),
                    scale * Math.sin(pos),
                    scale * i)
            }
            counter += s
        }
    }

    const parities: BlockEntery[] = readFile().Parities;
    parities.forEach(parity => {
        let line = scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
        let vertixTo = scene.getObjectByName(parity.LeftPos.toString());
        let vertixFrom = scene.getObjectByName(parity.RightPos.toString());
        if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
            switch (parity.Strand) {
                case horizontal: {
                    //@ts-ignore
                    let array = line.geometry.attributes.position
                    array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                    array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                    // Tegner kun de to første 3d-punktene i listen.
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);
                    //@ts-ignore
                    line.geometry.attributes.position.needsUpdate = true;

                }
                case LHStrand: {
                    //@ts-ignore
                    let array = line.geometry.attributes.position
                    array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                    array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                    // Tegner kun de to første 3d-punktene i listen.
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);
                    //@ts-ignore
                    line.geometry.attributes.position.needsUpdate = true;

                }
                case RHStrand: {
                    //@ts-ignore
                    let array = line.geometry.attributes.position
                    array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                    array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                    // Tegner kun de to første 3d-punktene i listen.
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);
                    //@ts-ignore
                    line.geometry.attributes.position.needsUpdate = true;

                }
            }
        } else { console.log(parity.LeftPos + "_" + parity.RightPos) }
    });
}

function createDoubleD() {

    const scale = 10;
    const scaleSmall = scale * (Math.sqrt(2) / 2)
    var counter
    const offSetX = (scale + scale * (nrOfVertecties / s)) / 2;
    const offSetY = (scale + scale * s) / 2;

    for (let row = 1; row <= s; row++) {
        counter = row
        for (let col = 1; col <= (nrOfVertecties / s); col++) {
            var obj = scene.getObjectByName(counter.toString())
            if (typeof obj != undefined) {
                obj?.position.set(scale * col - offSetX, scale * (s - row) - offSetY, 0)
                obj!.visible = true;
                obj?.rotateY(col)
            }
            counter += s
        }
    }

    const parities: BlockEntery[] = readFile().Parities;
    parities.forEach(parity => {
        let line = scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
        let vertixFrom = scene.getObjectByName(parity.LeftPos.toString());
        let vertixTo = scene.getObjectByName(parity.RightPos.toString());
        if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
            //@ts-ignore
            let array = line.geometry.attributes.position
            switch (parity.Strand) {
                case horizontal: {
                    if (vertixFrom?.position.x! > vertixTo?.position.x!) {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y, vertixFrom?.position.z)
                    } else {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)
                    }
                    // Tegner kun de to første 3d-punktene i listen.
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);


                    break;
                }
                case LHStrand: {
                    if (vertixFrom?.position.y! < vertixTo?.position.y! && vertixFrom?.position.x! > vertixTo?.position.x!) {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! + scale, vertixFrom?.position.z)
                    }
                    else if (vertixFrom?.position.y! > vertixTo?.position.y!) {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! + scale, vertixFrom?.position.z)
                    } else {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)
                    }
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);

                    break;
                }
                case RHStrand: {
                    if (vertixFrom?.position.x! > vertixTo?.position.x! && vertixFrom?.position.y! > vertixTo?.position.y!) {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! - scale, vertixFrom?.position.z)
                    }
                    else if (vertixFrom?.position.y! < vertixTo?.position.y!) {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixFrom?.position.x! + scale, vertixFrom?.position.y! - scale, vertixFrom?.position.z)
                    } else {
                        array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                        array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)
                    }

                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);
                    break;
                }
            }
            //@ts-ignore
            line.geometry.attributes.position.needsUpdate = true;
        }
    });

}
function createTexture(text: string, radius: number) {
    let c = document.createElement("canvas");
    c.width = 2 * Math.PI * radius;
    c.height = 2 * radius;
    let step = c.width / 4;
    let ctx = c.getContext("2d");
    ctx!.fillStyle = "#000000";
    ctx!.fillRect(0, 0, 5, c.height);
    ctx!.fillStyle = "#00ff00";
    ctx!.fillRect(0, 0, c.width, c.height);
    ctx!.font = (radius * 0.8) + "px black";
    ctx!.fillStyle = "black";
    ctx!.textBaseline = "middle";
    ctx!.textAlign = "center";
    for (let i = 0; i < 4; i++) {
        ctx!.fillText(text,step * i, (step + (radius * 0.5)) * 0.5);
    }

    return new THREE.CanvasTexture(c);
}

function createTorus() {

    var deltaPi = (2 * Math.PI) / (nrOfVertecties / s)
    var deltaPi1 = (2 * Math.PI) / s
    var counter;
    const R = 3 * 10;
    const r = 2 * 5;

    for (let i = 0, c = 1; i <= 2 * Math.PI; i += deltaPi1, c++) {
        counter = c
        for (let j = 0; j <= 2 * Math.PI; j += deltaPi) {
            var obj = scene.getObjectByName(counter.toString())
            if (typeof obj != undefined) {
                obj?.position.set(
                    ((R + r * Math.cos(j)) * Math.cos(i)),
                    ((R + r * Math.cos(j)) * Math.sin(i)),
                    (r * Math.sin(j))
                );
                counter += s
            }
            else { console.log(counter) }
        }
    }

    const parities: BlockEntery[] = readFile().Parities;
    parities.forEach(parity => {
        let line = scene.getObjectByName(parity.LeftPos + "_" + parity.RightPos);
        let vertixTo = scene.getObjectByName(parity.LeftPos.toString());
        let vertixFrom = scene.getObjectByName(parity.RightPos.toString());
        if (typeof line != undefined && typeof vertixTo != undefined && typeof vertixFrom != undefined) {
            switch (parity.Strand) {
                case horizontal: {

                    //@ts-ignore
                    let array = line.geometry.attributes.position
                    array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                    array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                    // Tegner kun de to første 3d-punktene i listen.
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);
                    //@ts-ignore
                    line.geometry.attributes.position.needsUpdate = true;
                }
                case LHStrand: {
                    //@ts-ignore
                    let array = line.geometry.attributes.position
                    array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                    array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                    // Tegner kun de to første 3d-punktene i listen.
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);
                    //@ts-ignore
                    line.geometry.attributes.position.needsUpdate = true;

                }
                case RHStrand: {
                    //@ts-ignore
                    let array = line.geometry.attributes.position
                    array.setXYZ(0, vertixFrom?.position.x, vertixFrom?.position.y, vertixFrom?.position.z)
                    array.setXYZ(1, vertixTo?.position.x, vertixTo?.position.y, vertixTo?.position.z)

                    // Tegner kun de to første 3d-punktene i listen.
                    //@ts-ignore
                    line.geometry.setDrawRange(0, 2);
                    //@ts-ignore
                    line.geometry.attributes.position.needsUpdate = true;

                }
            }
        } else { console.log(parity.LeftPos + "_" + parity.RightPos) }
    });
}

function createLabelTest() {
    camera.position.z = 5;
    var obj = scene.getObjectByName("1");
    obj?.position.set(0,0,0)
    for (let i=2; i <= nrOfVertecties; i++) {
        var obj = scene.getObjectByName(i.toString());
        obj!.visible = false;
    }

}

function animate() {
    requestAnimationFrame(animate)

    controls.update()


    render()
}

function render() {
    renderer.render(scene, camera)
}

document.getElementById("btn-2d")?.addEventListener("click", createDoubleD);
document.getElementById("btn-lattice")?.addEventListener("click", createLattice);
document.getElementById("btn-torus")?.addEventListener("click", createTorus);
document.getElementById("btn-label-test")?.addEventListener("click", createLabelTest);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


function bitMap()
{
    var svg=document.getElementById("bitmap");
    const height = 168;
    const width = 168;
    svg?.setAttribute("height", height.toString());
    svg?.setAttribute("width", width.toString());
    for (let row = 0; row < width * 4; row ++) {
        for (let col = 0; col < height * 4; col++) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttributeNS(null, "x", (row * 4).toString());
            rect.setAttributeNS(null, "y", (col * 4).toString());
            rect.setAttributeNS(null, "width", "4");
            rect.setAttributeNS(null, "height", "4");
            rect.setAttributeNS(null, "style", GetRandomColor());
    
            svg?.appendChild(rect);
        }
    }
}

function GetRandomColor() : string {
    var dice = Math.random();
    if (dice < 0.5)
        return "fill:rgb(0,255,0);stroke-width:3;stroke:rgb(0,255,0)";
    if (dice < 0.75)
        return "fill:rgb(255,0,0);stroke-width:3;stroke:rgb(255,0,0)";
    return "fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,255)";
}


initObjects();

bitMap();

createLabelTest();

animate();
