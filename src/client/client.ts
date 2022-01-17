import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import SpriteText from 'three-spritetext';

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 50

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

    for (let i = 1; i < nrOfVertecties; i++) {
        let parityTo = i + s;

        // -- H Strand --
        if (parityTo < nrOfVertecties) {
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

        // -- RH Strand --
        let helper = i % s;
        // RH Top & middle
        if (helper >= 1) {
            parityTo = i + s + 1
            if (parityTo < nrOfVertecties) {
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
        }
        // RH Bottom
        else if (helper == 0) {
            parityTo = i + (s * p) - ((s * s) - 1)
            if (parityTo < nrOfVertecties) {
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
        }
        // -- LH Strand --
        if (helper == 1) {
            // top
            parityTo = i + s * p - Math.pow((s - 1), 2)
            if (parityTo < nrOfVertecties) {
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
        }
        else if (helper == 0 || helper > 1) {
            // central && bottom
            parityTo = i + s - 1
            if (parityTo < nrOfVertecties) {
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
        }

    }
    return { Vertecies: vertecies, Parities: parities }
}


function createLattice() {
    const piParts = (2 * Math.PI) / 5;
    const scale = 10;

    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const HlineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const RHlineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const LHlineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

    var objects = readFile();
    var x: number;
    var y: number;
    var z: number;
    var obj: THREE.Mesh;
    var counter: number = 1;

    for (let i = 1; i <= s; i++) {
        counter = i
        z = scale * i
        for (let pos = 0; pos < Math.PI * 2; pos += piParts) {
            x = scale * Math.cos(pos);
            y = scale * Math.sin(pos);
            let text = new SpriteText(counter.toString())
            text.position.set(x + Math.abs(x*0.1), y + Math.abs(y*0.1), z)
            text.textHeight = 2;
            obj = new THREE.Mesh(geometry, material);
            obj.position.set(x, y, z);
            obj.name = counter.toString();
            counter += s;
            scene.add(obj)
            scene.add(text)

        }
    }
    objects.Parities.forEach(parity => {
        console.log(`${parity.LeftPos} -> ${parity.RightPos} `)
        let objFrom = scene.getObjectByName(parity.LeftPos.toString());
        let objTo = scene.getObjectByName(parity.RightPos.toString());

        try {
            const geometry = new THREE.BufferGeometry().setFromPoints([objFrom?.position!, objTo?.position!]);
            if (parity.Strand == horizontal) {
                const line = new THREE.Line(geometry, HlineMaterial);
                scene.add(line);

            }
            if (parity.Strand == LHStrand) {
                const line = new THREE.Line(geometry, LHlineMaterial);
                scene.add(line);

            }
            if (parity.Strand == RHStrand) {
                const line = new THREE.Line(geometry, RHlineMaterial);
                scene.add(line);

            }
        }
        catch (e: unknown) {
        }

    });
}


function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}

createLattice();

animate();
