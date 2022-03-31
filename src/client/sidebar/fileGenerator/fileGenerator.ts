import { PopUp } from "./popUp/popUp";

export {FileGenerator}

class FileGenerator {

    public constructor() {
        this.createLayOut();
        this.createPopUpLayOut();
        this.showPopUp();
    }

    public Hide() {
        this.visible = false;
        this.Container.style.display = "none";
    }

    public Show() {
        this.visible = true;
        this.Container.style.display = "unset";
    }

    private hidePopUp() {
        this.popUp.Container.style.display = "none";
    }

    public showPopUp() {
        this.popUp.Container.style.display = "unset";
    }

    private createLayOut() {
        this.Container.innerText = "QWERASDFZXVZADSFQWER";
        this.Container.addEventListener("data-generated", this.HandleDataGenerated.bind(this));
        this.Container.append(this.popUp.Container);
    }

    private HandleDataGenerated() {
        this.hidePopUp();
    }

    private createPopUpLayOut() {
        
    }

    public Container: HTMLDivElement = document.createElement("div");
    private popUp: PopUp = new PopUp();
    private visible: boolean = false;
    
}