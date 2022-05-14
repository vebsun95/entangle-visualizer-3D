# Entangle-Visualizer-3D

<h2> Requirments </h2>

*Typescript*

<h2> How to run </h2>

```npm install . ``` \
```npm run dev ```

Testlogs can be found here: https://liveuis-my.sharepoint.com/:f:/g/personal/242918_uis_no/EtdA0as744hDvrHfx3Cr98MBo9qWJ42A0laCtwvq6ACbkw?e=hQKfP4

<h2> Overview </h2>

Entangle Visualizer 3d is a visualisation tool for
the Snarl repair algorithm. The application makes it possible to inspect the log file in a more informative
manner than just line by line in a text file. Data blocks and interconnections are represented as spheres
and lines respectively creating a mesh. The colors of the spheres and lines are changed to highlight the
different states of the objects. This provides an intuitive display of information where issues and solutions
are easily viewable. Further the application provides the user with the possibility to create a setup to test
the download sequence of Snarl. This makes it possible to test the Snarl download sequence providing it
different starting points.

<h2> Shortcuts </h2>

| Key bind  | Function  |
| :------------ |:---------------:|
| <kbd> &nbsp; &rightarrow; &nbsp;</kbd>      | Forward(1)         |
|  <kbd> &nbsp; &leftarrow; &nbsp;</kbd>      | Backward(1)        |
| <kbd> &nbsp; &uparrow; &nbsp; </kbd>  | Forward(10)        |
| <kbd> &nbsp; &downarrow; &nbsp; </kbd>  | Backward(10)        |
| <kbd> &nbsp; Space &nbsp;</kbd> | Render lattice based on latest log entry        |
| <kbd> &nbsp; Q &nbsp;</kbd> | Go to start in log        |
| <kbd> &nbsp; W &nbsp;</kbd> | Go to end in log        |
| <kbd> Ctrl </kbd> + <kbd> &rightarrow; </kbd>  | Move column by +1        |
| <kbd> Ctrl </kbd> + <kbd> &leftarrow; </kbd>  | Move column by -1        |
| <kbd> Ctrl </kbd> + <kbd> &uparrow; </kbd>  | Move column by +10        |
| <kbd> Ctrl </kbd> + <kbd> &downarrow; </kbd>  | Move column by -10        |
