export interface RuleI {
    container: HTMLDivElement,
    strand: HTMLSpanElement,
    top: InputLabelI,
    middel: InputLabelI,
    bot: InputLabelI,
}

interface InputLabelI {
    container: HTMLDivElement,
    type: HTMLSpanElement,
    label: HTMLLabelElement,
    input: HTMLInputElement,
}