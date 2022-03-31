import { FileInput } from "./fileInput/fileInput";
import { PlayBack } from "./playBack/playBack";

export class SideBar {

    private visible: boolean = true;
    Container: HTMLDivElement = document.createElement("div");
    PlayBackEle: PlayBack = new PlayBack();
    FileInput: FileInput = new FileInput();

    constructor() {
        this.createLayout();
    }

    private createLayout() {
        this.Container.id = "side-bar";
        this.Container.append(this.PlayBackEle.Container, this.FileInput.Container);
    }

    private toggleVisible() {
        if (this.visible) {
            this.Container.style.width = "1em";
        } else {
            this.Container.style.width = "";
        }
        this.visible = !this.visible;
    }
}


