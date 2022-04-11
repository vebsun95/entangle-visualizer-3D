export {ParityShiftMock}

class ParityShiftMock extends Map{
    constructor() {
        super()
    }

    public get(n: number): number {
        return n;
    }
}