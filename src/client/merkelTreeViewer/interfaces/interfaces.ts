export interface Tile {
    Container: SVGElement,
    Rect: SVGRectElement,
    Text: SVGTextElement,
}

export interface InfoGraphic {
    Container: HTMLDivElement;
    Text: HTMLParagraphElement;
    BreadCrumbs: HTMLParagraphElement;
    BreadCrumbsIndex: number[];
    ViewButtons: HTMLButtonElement[];
    ViewButtonsContainer: HTMLDivElement;
}

export interface MouseOverElement {
    Container: HTMLDivElement,
    List: HTMLUListElement,
}