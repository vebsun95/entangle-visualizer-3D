import { FileGenerator } from "./fileGenerator/fileGenerator";
import { FileInput } from "./fileInput/fileInput";
import { PlayBack } from "./playBack/playBack";

export class SideBar {

    private visible: boolean = true;
    private backButton: HTMLSpanElement = document.createElement("span");
    public Container: HTMLDivElement = document.createElement("div");
    public PlayBackEle: PlayBack = new PlayBack();
    public FileInput: FileInput = new FileInput();
    public FileGenerator: FileGenerator = new FileGenerator();

    constructor() {
        this.createLayout();
        this.PlayBackEle.Hide();
        this.FileGenerator.Hide();
    }

    private createLayout() {
        this.Container.id = "side-bar";
        this.backButton.id = "sidebar-backButton";
        this.backButton.addEventListener("click", this.backButtonClicked.bind(this));
        this.backButton.style.display = "none";
        this.Container.addEventListener("new-file-upload", this.handleOnNewFileUploaded.bind(this));
        this.Container.addEventListener("file-generator", this.handleFileGenerator.bind(this));

        this.backButton.innerHTML = "&#10060;";

        this.Container.append(this.backButton, this.PlayBackEle.Container, this.FileInput.Container, this.FileGenerator.Container);
    }

    private handleFileGenerator() {
        this.backButton.style.display = "unset";
        this.FileInput.Hide();
        this.FileGenerator.Show();
        this.FileGenerator.showPopUp();
    }

    private handleOnNewFileUploaded() {
        this.backButton.style.display = "unset";
        this.FileInput.Hide();
        this.PlayBackEle.Show();
    }

    private backButtonClicked() {
        this.backButton.style.display = "none";
        this.PlayBackEle.Hide();
        this.FileGenerator.Hide();
        this.FileInput.Show();
        this.Container.dispatchEvent( new Event("back-to-start", { bubbles: true}));
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


