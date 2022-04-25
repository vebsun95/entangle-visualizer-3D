import { DataContainer } from "../../SharedKernel/dataContainer";
import { MyControls } from "../MyControls";

export interface View extends DataContainer {
    verticesGroup: THREE.Group,
    paritiesGroup: THREE.Group,
    ghostGroup: THREE.Group,
    controls: MyControls,
    GoTo(position: number): void,
    GoRight(): void,
    GoLeft(): void,
    GoUp(): void,
    GoDown(): void,
    Animate(): void,
}