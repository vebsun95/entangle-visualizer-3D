import * as THREE from 'three'
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 50;

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

interface BlockEntery {
    IsParity: boolean,
    Position: number,
    LeftPos: number,
    RightPos: number,
    Strand: number,
}

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

var curve: THREE.QuadraticBezierCurve3;

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
            scene.add(obj)

            counter += s;
        }
    }

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
    var piParts: number = (2 * Math.PI) / (nrOfVertecties / s);
    const scale: number = 10;

    for (let i = 1; i <= s; i++) {
        counter = i
        for (let pos = 1; pos <= 2 * Math.PI; pos += piParts) {
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
                    console.log(line);

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
        }
    });
}

function createDoubleD() {

    const scale = 10;

    for (let row = 0; row < s; row++) {
        for (let col = 1; col <= (nrOfVertecties / s); col++) {
            var obj = scene.getObjectByName(((row * s) + col).toString())
            if (typeof obj != undefined) {
                obj?.position.set(scale * row, scale * col, 0)
            }
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
                    console.log(line);

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
        }
    });

}

function createTexture(text: string, radius: number) {
    let c = document.createElement("canvas");
    c.width = 2 * Math.PI * radius;
    c.height = 2 * radius;
    let step = c.width / 3
    let ctx = c.getContext("2d");
    ctx!.fillStyle = "#00ff00";
    ctx!.fillRect(0, 0, c.width, c.height);
    ctx!.font = "4em black";
    ctx!.fillStyle = "black";
    ctx!.textBaseline = "middle";
    for (let i = 0; i < 3; i++) {
        ctx!.fillText(text, step * i, step * 0.5);
    }

    return new THREE.CanvasTexture(c);
}

function createTorus() {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    var piParts = (2 * Math.PI) / (nrOfVertecties / s)
    const scale = 20;
    var counter;
    const points: Vector3[] = [];


    for (let i = 0; i <= 2 * Math.PI; i += piParts) {
        var offsetX = scale * Math.sin(i);
        var offsetY = scale * Math.cos(i);
        counter = i;

        points.push(new THREE.Vector3(offsetX, offsetY, 0));
        const points1: Vector3[] = [];

        for (let j = 0; j <= 2 * Math.PI; j += piParts) {
            points1.push( new THREE.Vector3(offsetX + Math.sin(j), offsetY + Math.cos(j), 0 ) )
            const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
            const line1 = new THREE.Line(geometry1, material);
            line1.lookAt( new THREE.Vector3(0, 0, 0));
            scene.add(line1)
        }
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line)

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

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );


initObjects();
createTorus();

animate();
