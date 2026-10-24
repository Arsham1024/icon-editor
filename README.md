# icon-editor

A local editor for 24 × 24 line icons in SVG. It shows the icon on a grid with numbered points. You can drag a point, type its position, or edit the path data, and the previews update at real size.

The editor reads the icons from a folder on disk. It does not write files: copy the clean SVG from the page, or let an agent read it with `window.iconEditor.svg`.

## Start it

Give the server the folder of the icons:

```bash
node serve.mjs path/to/icons
```

Then open `http://localhost:4310/?file=<name>.svg`. Set `PORT` to use a different port.

In a project with Claude Code, add this entry to `.claude/launch.json` and start it with `preview_start`:

```json
{
  "name": "icon-editor",
  "runtimeExecutable": "node",
  "runtimeArgs": ["../icon-editor/serve.mjs", "<path to the icons folder>"],
  "port": 4310
}
```

## What it does

- Shows a 24 × 24 grid, with a dashed square for the 2–22 live area.
- Gives each end point a number. Points at the same spot share one handle, for example "1, 4".
- Snaps a dragged point to 0.25, 0.75 or 0.125, or not at all.
- Moves joined points together, so a shared corner stays one corner.
- Shows curve handles for `C` and `Q` commands.
- Shows previews at 96, 22 and 16 px, on a dark and a light background.
- Writes a clean SVG: one path, absolute commands, 3 decimals maximum, and `currentColor`.
- Has Undo (Cmd+Z).

## Files

- `index.html` — the editor page. It has no dependencies.
- `serve.mjs` — a Node server on `127.0.0.1`. It gives the page the file list and read access to the icons folder.

## Safety

- The server listens on `127.0.0.1` only, so other computers cannot connect to it.
- It accepts only requests addressed to `localhost` or `127.0.0.1`. This stops a web page that uses DNS rebinding.
- It serves only `.svg` files from the folder that you give it, with no subfolders and no `..` paths.
- It never writes to disk.
