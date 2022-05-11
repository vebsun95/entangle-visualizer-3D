import { BitMap } from "./bitmap/bitmap";
import { MerkelTreeViewer } from "./merkelTreeViewer/merkelTreeViewer";
import { RendererObject } from "./renderer/renderObject";
import { SideBar } from "./sidebar/sidebar";
import { ContentJSON, Vertex, DownloadConfigLog, TreeLayoutLog, DownloadEntryLog, Parity, VertexEvent, ParityEvent } from "./SharedKernel/interfaces";
import { COLORS, DLStatus, MSG, RepStatus } from "./SharedKernel/constants";
import { BitMapClickedEvent } from "./bitmap/Events/bitMapClicked";
import { BackToStartEvent } from "./sidebar/events/backToStart";
import { DataGeneratedEvent } from "./sidebar/events/dataGenerated";
import { NewFileUploadEvent } from "./sidebar/events/newFileUpload";
import { LogChangedEvent } from "./sidebar/events/logChangedEvent";
import { LogChangedClickedEvent } from "./sidebar/events/logChangedClicked";
import { ChangeViewEvent } from "./sidebar/events/changeView";
import { LogEntryEvent } from "./sidebar/events/logEntryEvents";
import { LatticeClickedEvent } from "./renderer/events/latticeClicked";
import { ParseLogEntry } from "./SharedKernel/ParseLogEntry";
import { LaticeMovedEvent } from "./renderer/events/latticeMovedEvent";



export class App {
    Container = document.body.appendChild(document.createElement("div"));
    renderer = new RendererObject();
    bitMap = new BitMap();
    merkelTree = new MerkelTreeViewer();
    sideBar = new SideBar();
    alpha = 0;
    s = 0;
    p = 0;
    vertices: Map<number, Vertex> = new Map();
    parities: Map<number, Parity>[] = [];
    parityShift: Map<number, number> = new Map();



    constructor() {
        this.AddEventListeners();
        this.createLayout();
    }

    createLayout() {
        this.Container.id = "overlay-layout";
        this.Container.append(this.merkelTree.Container, this.sideBar.Container, this.bitMap.Container);
    }
    // Used to propagate changes to components when central data gets reinitialized
    UpdateData() {
        this.renderer.UpdateData(this.alpha, this.s, this.p, this.vertices, this.parities, this.parityShift);
        this.bitMap.UpdateData(this.alpha, this.s, this.p, this.vertices, this.parities, this.parityShift);
        this.merkelTree.UpdateData(this.alpha, this.s, this.p, this.vertices, this.parities, this.parityShift);

        this.renderer.HandleUpdatedData();
        this.bitMap.HandleUpdatedData();
        this.merkelTree.HandleUpdatedData();
    }

    AddEventListeners() {
        this.Container.addEventListener(DataGeneratedEvent.EventName, this.HandleDataGenerated.bind(this) as EventListener);
        this.Container.addEventListener(BackToStartEvent.EventName, this.HandleBackToStart.bind(this));
        this.Container.addEventListener(BitMapClickedEvent.EventName, this.HandleBitMapClicked.bind(this) as EventListener);
        this.Container.addEventListener(NewFileUploadEvent.EventName, this.HandleNewFileUploaded.bind(this) as EventListener);
        this.Container.addEventListener(LogChangedClickedEvent.EventName, this.HandleLogChangedClicked.bind(this) as EventListener);
        this.Container.addEventListener(LogChangedEvent.EventName, this.HandleLogChanged.bind(this) as EventListener);
        this.Container.addEventListener(LogEntryEvent.EventName, this.HandleLogEntryEvents.bind(this) as EventListener);
        this.Container.addEventListener(ChangeViewEvent.EventName, this.HandleChangeView.bind(this) as EventListener);
        window.addEventListener(LaticeMovedEvent.EventName, this.HandleLaticeMovedEvent.bind(this) as EventListener);
        window.addEventListener(LatticeClickedEvent.EventName, this.HandleLatticeClicked.bind(this) as EventListener);
        window.addEventListener('resize', this.HandleWindowResize.bind(this), false);
        window.addEventListener("keydown", this.HandleKeyDown.bind(this));
    }

    // LatticeClickedEvent is emitted by the renderer, only when creating a test scenario.
    // Updates the state of data/parity, update test scenario code generator
    HandleLatticeClicked(e: LatticeClickedEvent) {
        let strand = e.strand;
        let index = e.index;
        let clickedObj: Vertex | Parity

        if (strand != null && index != null) {
            clickedObj = this.parities[strand].get(index)!;
        } else if (index != null) {
            clickedObj = this.vertices.get(index)!;
        } else return

        if (clickedObj.Color == COLORS.GREY) {
            clickedObj.Color = COLORS.RED;
            this.sideBar.FileGenerator.SetUnavailable(index, strand);
        } 
        else if (clickedObj.Color == COLORS.RED) {
            clickedObj.Color = COLORS.YELLOW;
            this.sideBar.FileGenerator.SetDelayed(index, strand);
        } 
        else if (clickedObj.Color == COLORS.YELLOW) {
            clickedObj.Color = COLORS.ORANGE;
            this.sideBar.FileGenerator.SetDelayedUnavailable(index, strand);
        } 
        else if (clickedObj.Color == COLORS.ORANGE) {
            clickedObj.Color = COLORS.GREY;
            this.sideBar.FileGenerator.RemoveIndex(index, strand);
        }
        this.renderer.Update();
        this.bitMap.Update();
    }

    // DataGeneratedEvent is emitted by the sidebar, when the users changes to config for a test scenario.
    HandleDataGenerated(e: DataGeneratedEvent) {
        this.bitMap.Show();
        this.renderer.Simulating = false;
        this.alpha = e.alpha;
        this.s = e.s;
        this.p = e.p;
        this.vertices = e.vertices;
        this.parities = e.parities;
        this.parityShift = e.parityShift;
        this.UpdateData();
    }

    // BackToStartEvent is emitted by the sidebar, when a users clicks the cross in the top-right corner
    HandleBackToStart() {
        this.renderer.View = 0;
        this.renderer.Simulating = true;
        this.bitMap.Hide();
        this.merkelTree.Hide();
    }

    // ChangeView is emitted by the sidebar, when a users changes the drop-down containing the views.
    HandleChangeView(e: ChangeViewEvent) {
        this.renderer.View = e.newView;
    }
    HandleKeyDown(e: KeyboardEvent) {
        if (e.ctrlKey) {
            if (e.key == "ArrowRight") {
                this.renderer.GoRight();
            } else if (e.key == "ArrowLeft") {
                this.renderer.GoLeft();
            } else if (e.key == "ArrowDown") {
                this.renderer.GoDown();
            } else if (e.key == "ArrowUp") {
                this.renderer.GoUp();
            }
        }
        else {
            if (e.key == "ArrowLeft") {
                this.sideBar.PlayBackEle.SimulateClick(-1);
            } else if (e.key == "ArrowRight") {
                this.sideBar.PlayBackEle.SimulateClick(1);
            } else if (e.key == "ArrowDown") {
                this.sideBar.PlayBackEle.SimulateClick(-10);
            } else if (e.key == "ArrowUp") {
                this.sideBar.PlayBackEle.SimulateClick(10);
            } else if (e.code == "Space") {
                let latestEvent = this.sideBar.PlayBackEle.GetLatestEvent();
                this.bitMap.SimulateClick(latestEvent);
            } else if (e.key == "q" || e.key == "Q") {
                this.sideBar.PlayBackEle.GoToStart();
            } else if (e.key == "w" || e.key == "W") {
                this.sideBar.PlayBackEle.GoToEnd();
            } else if (e.key == "f") {
                this.sideBar.PlayBackEle.FocusInput();
                e.preventDefault();
            }
        }
    }

    // LogEntryEvent is emitted by the sidebar, when ever a user steps for-/backwards in the simulation.
    HandleLogEntryEvents(e: LogEntryEvent) {
        var vertexEvent: VertexEvent;
        var parityEvent: ParityEvent;
        var vertex: Vertex;
        var parity: Parity;
        var oldColor: number;
        var deltaDDL = 0, deltaDRep = 0, deltaDUna = 0, deltaDRepF = 0, deltaPDL = 0, deltaPRep = 0, deltaPUna = 0, deltaPRepF = 0;
        if (e.NeedsReset) {
            // If true sets all state variables back to default.
            for (var vertex of this.vertices.values()) {
                vertex.Color = COLORS.GREY;
                vertex.DamagedChildren = 0
            }
            for (var parityMap of this.parities) {
                for (var parity of parityMap.values()) {
                    parity.Color = COLORS.GREY;
                    parity.From = null;
                    parity.To = null;
                    parity.DamagedChildren = 0;
                }
            }

            this.sideBar.PlayBackEle.NrOfDataDl = 0;
            this.sideBar.PlayBackEle.NrOfDataRep = 0;
            this.sideBar.PlayBackEle.NrOfDataUna = 0;
            this.sideBar.PlayBackEle.NrOfDataRepFailed = 0;
            this.sideBar.PlayBackEle.NrOfParityDl = 0;
            this.sideBar.PlayBackEle.NrOfParityRep = 0;
            this.sideBar.PlayBackEle.NrOfParityUna = 0;
            this.sideBar.PlayBackEle.NrOfParityRepFailed = 0;

        }
        for (vertexEvent of e.VertexEvents) {
            vertex = this.vertices.get(vertexEvent.Position)!;
            // Keep track of state change is the  data blocks.
            switch (vertex.Color) {
                case COLORS.GREEN:
                    deltaDDL--;
                    break;
                case COLORS.RED:
                    deltaDUna--;
                    break;
                case COLORS.BLUE:
                    deltaDRep--;
                    break;
                case COLORS.YELLOW:
                    deltaDRepF--;
                    break;
            }
            switch (vertexEvent.NewColor) {
                case COLORS.GREEN:
                    deltaDDL++;
                    break;
                case COLORS.RED:
                    deltaDUna++;
                    break;
                case COLORS.BLUE:
                    deltaDRep++;
                    break;
                case COLORS.YELLOW:
                    deltaDRepF++;
            }
            oldColor = vertex.Color;
            vertex.Color = vertexEvent.NewColor;
            // Updates the damages Children on data blocks.
            if (vertexEvent.NewColor == COLORS.RED) {
                vertex = this.vertices.get(vertex.Parent)!;
                vertex.DamagedChildren++;
            } else if ((vertexEvent.NewColor == COLORS.GREEN || vertexEvent.NewColor == COLORS.BLUE) && oldColor == COLORS.RED) {
                vertex = this.vertices.get(vertex.Parent)!;
                vertex.DamagedChildren--;
            }
        }
        for (parityEvent of e.ParityEvents) {
            let strand = parityEvent.Strand;
            parity = this.parities[strand].get(parityEvent.Index)!;
            switch (parity.Color) {
                case COLORS.GREEN:
                    deltaPDL--
                    break;
                case COLORS.RED:
                    deltaPUna--;
                    break;
                case COLORS.BLUE:
                    deltaPRep--
                    break;
                case COLORS.YELLOW:
                    deltaPRepF--;
                    break;
            }
            switch (parityEvent.NewColor) {
                case COLORS.GREEN:
                    deltaPDL++;
                    break;
                case COLORS.RED:
                    deltaPUna++;
                    break;
                case COLORS.BLUE:
                    deltaPRep++;
                    break;
                case COLORS.YELLOW:
                    deltaPRepF++;
            }
            parity.From = parityEvent.From;
            parity.To = parityEvent.To;
            oldColor = parity.Color;
            parity.Color = parityEvent.NewColor;
            if (parityEvent.NewColor == COLORS.RED) {
                parity = this.parities[strand].get(parity.Parent)!;
                parity.DamagedChildren++;
            } else if ((parityEvent.NewColor == COLORS.GREEN || parityEvent.NewColor == COLORS.BLUE) && oldColor == COLORS.RED) {
                parity = this.parities[strand].get(parity.Parent)!;
                parity.DamagedChildren--;
            }

        }
        // ---- Updates the sidebar stats-table ----
        deltaDDL   ? this.sideBar.PlayBackEle.NrOfDataDl += deltaDDL : null;
        deltaDRep  ? this.sideBar.PlayBackEle.NrOfDataRep += deltaDRep : null;
        deltaDUna  ? this.sideBar.PlayBackEle.NrOfDataUna += deltaDUna : null;
        deltaDRepF ? this.sideBar.PlayBackEle.NrOfDataRepFailed += deltaDRepF : null;

        deltaPDL   ? this.sideBar.PlayBackEle.NrOfParityDl += deltaPDL : null;
        deltaPRep  ? this.sideBar.PlayBackEle.NrOfParityRep += deltaPRep : null;
        deltaPUna  ? this.sideBar.PlayBackEle.NrOfParityUna += deltaPUna : null;
        deltaPRepF ? this.sideBar.PlayBackEle.NrOfParityRepFailed += deltaPRepF : null;
        // ----
        this.renderer.Update();
        this.bitMap.Update();
        this.merkelTree.Update();
    }
    //BitMapClickedEvent is emitted by the Bitmap, when a user clicks on it.
    // Contains an lattice position, tell renderer to render that part of the lattice.
    HandleBitMapClicked(e: BitMapClickedEvent) {
        this.renderer.GoTo(e.VertexIndex)
    }
    // LaticeMovedEvent is emitted by the renderer, when a user uses one of the shortcuts to move the lattice.
    HandleLaticeMovedEvent(e: LaticeMovedEvent) {
        this.bitMap.SimulateClick(e.position);
    }
    // NewFileUploadEvent is emitted by the sidebar, when a user uploads a new file through the file input.
    HandleNewFileUploaded(e: NewFileUploadEvent) {
        this.renderer.Simulating = true;
        this.bitMap.Show();
        this.merkelTree.Show();
        this.sideBar.PlayBackEle.Filename = e.fileName;
        this.sideBar.PlayBackEle.CreateChangeLogBtns(e.nrOfLogs);
        this.sideBar.FileInput.ChangeLog(0);
    }
    // LogChangedClickedEvent is emitted by the sidebar, when a user changes the dropdown containg the different logs.
    HandleLogChangedClicked(e: LogChangedClickedEvent) {
        let newLog = e.changeToLog;
        this.sideBar.FileInput.ChangeLog(newLog);
    }
    // LogChangedEvent is emitted by the sidebar, after the fileinput has completed parsing a log.
    HandleLogChanged(e: LogChangedEvent) {
        var lineCounter=0, parityIndex: number;

        let content: ContentJSON[] = e.newContent
        var line: ContentJSON = content[lineCounter++]
        this.alpha = (line.log as DownloadConfigLog).alpha;
        this.s = (line.log as DownloadConfigLog).s;
        this.p = (line.log as DownloadConfigLog).p;
        this.sideBar.PlayBackEle.Config = line.log as DownloadConfigLog;
        var ParityLabels = (line.log as DownloadConfigLog).parityLabels;
        var dataShiftRegister = (line.log as DownloadConfigLog).dataShiftRegister;
        var parityShift = (line.log as DownloadConfigLog).parityLeafIdToCanonIndex;
        this.parityShift = new Map();
        for (var value in parityShift) {
            this.parityShift.set(Number.parseInt(value), parityShift[value]);
        }
        var AdrToStrand: Map<string, number> = new Map();
        this.vertices.clear();
        this.parities = Array(this.alpha);
        for (let i = 0; i < this.parities.length; i++) {
            this.parities[i] = new Map();
        }
        var log: TreeLayoutLog;
        line = content[lineCounter++]
        while (line.msg == MSG.TreeLayout) {
            log = line.log as TreeLayoutLog;
            if (line.type == "Data") {
                this.vertices.set(log.index, {
                    Index: dataShiftRegister[log.index],
                    Color: COLORS.GREY,
                    Parent: log.parent ? dataShiftRegister[log.parent] : 0,
                    Depth: log.depth,
                    Children: [],
                    DamagedChildren: 0,
                });
            } else {
                parityIndex = ParityLabels.indexOf(line.type!)
                this.parities[parityIndex].set(log.index, {
                    Index: log.index,
                    From: null,
                    To: null,
                    Color: COLORS.GREY,
                    Parent: log.parent || 0,
                    Depth: log.depth,
                    Children: [],
                    DamagedChildren: 0,
                });
                AdrToStrand.set(log.key, parityIndex);
            }
            line = content[lineCounter++]
        }
        var swappedVertex: Vertex;
        var tempDepth: number;
        var tempParent: number;
        var allReadySwapped: number[] = [];
        for (var [position, vertex] of this.vertices.entries()) {
            if (position != vertex.Index && (!allReadySwapped.includes(position) || !allReadySwapped.includes(vertex.Index))) {
                swappedVertex = this.vertices.get(vertex.Index)!;

                tempParent = vertex.Parent;
                vertex.Parent = swappedVertex.Parent;
                swappedVertex.Parent = tempParent;

                tempDepth = vertex.Depth;
                vertex.Depth = swappedVertex.Depth;
                swappedVertex.Depth = tempDepth;

                allReadySwapped.push(position, vertex.Index);
            }
        }
        for (var [position, vertex] of this.vertices.entries()) {
            if (vertex.Parent != 0) {
                this.vertices.get(vertex.Parent)?.Children.push(position);
            }
        }
        for (var parityMap of this.parities) {
            for (var [position, parity] of parityMap.entries()) {
                if (parity.Parent != 0) {
                    parityMap.get(parity.Parent)!.Children.push(parity.Index);
                }
            }
        }
        for (var vertex of this.vertices.values()) {
            if (vertex.Children.length) {
                vertex.Children.sort((a, b) => {
                    var v1 = this.vertices.get(a)!;
                    var v2 = this.vertices.get(b)!;
                    return v1.Index - v2.Index;
                })
            }
        }

        var logEntry: DownloadEntryLog | TreeLayoutLog;
        var color: number, strand: number;
        var LogEntries: (ParityEvent | VertexEvent)[] = [];
        while (line.msg == MSG.DlEntry || line.msg == MSG.ParityTreeEntry) {
            if (line.msg == MSG.DlEntry) {
                logEntry = line.log as DownloadEntryLog;

                if (logEntry.downloadStatus == DLStatus.Pending || logEntry.repairStatus == RepStatus.Pending) {
                    line = content[lineCounter++]
                    continue
                }
                color = ParseLogEntry(logEntry);
                if (logEntry.parity) {
                    strand = ParityLabels.indexOf(logEntry.class);
                    LogEntries.push({
                        Index: this.parityShift.get(logEntry.start!)!,
                        Strand: strand,
                        From: logEntry.start!,
                        To: logEntry.end!,
                        NewColor: color
                    } as ParityEvent);
                } else {
                    LogEntries.push({
                        Position: logEntry.position,
                        NewColor: color,
                    } as VertexEvent);
                }
            }
            else if (line.msg == MSG.ParityTreeEntry) {
                logEntry = line.log as TreeLayoutLog;
                LogEntries.push({
                    Index: logEntry.index,
                    From: null,
                    To: null,
                    NewColor: COLORS.GREEN,
                    Strand: AdrToStrand.get(logEntry.key) || 0,
                } as ParityEvent)
            }
            line = content[lineCounter++]
        }
        this.merkelTree.StrandLabels = ParityLabels;
        this.sideBar.PlayBackEle.StrandLabels = ParityLabels;
        this.sideBar.PlayBackEle.LogEntries = LogEntries;
        this.UpdateData();
    }
    HandleWindowResize() {
        this.renderer.onWindowResize();
        this.merkelTree.onWindowResize();
        this.bitMap.onWindowResize();
    }
}