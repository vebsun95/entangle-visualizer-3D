import { DataContainer } from "../../SharedKernel/dataContainer";
import { MyControls } from "../MyControls";

export interface View extends DataContainer {
    controls: MyControls,
    Update(): void,
    GoTo(position: number): void,
    HandleUpdatedData(): void,
    Animate(): void,
    StartCamera: THREE.Vector3,
}