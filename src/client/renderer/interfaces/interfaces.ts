import { DataContainer } from "../../SharedKernel/dataContainer";

export interface View extends DataContainer {
    Update(): void,
    GoTo(position: number): void,
    HandleUpdatedData(): void,
    StartCamera: THREE.Vector3,
}