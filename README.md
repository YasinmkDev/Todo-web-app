# Notion Todo

A responsive, Notion-inspired task manager with a warm notebook aesthetic. Organize work into projects, track recurring routines, and review progress in list, board, calendar, and analytics views.

## Features

- Create and organize tasks with descriptions, subtasks, tags, due dates and times, estimated effort, priorities, and statuses.
- Group tasks into customizable projects.
- Set recurring schedules for daily, weekday, weekly, monthly, or yearly tasks, with completion streak tracking.
- Switch between list, Kanban board, calendar, and productivity analytics views.
- Filter and search tasks by text, project, priority, status, tags, due dates, or recurrence.
- Save and restore local snapshots, or import and export task and project data as JSON.
- Use quick-add shortcuts such as `#tag` and `!p1` in task titles.
- Keep task, project, sync-state, and snapshot data in browser `localStorage`.

> **Storage and sync:** Data is stored locally in the current browser. The sync panel provides sync-status and offline-mode UI demonstrations, but this project does not currently connect to a remote cloud-sync service. Use JSON export or snapshots to back up your data.

## Getting started

### Requirements

- Node.js (current LTS recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (the development server uses port `3000` by default).

No API key or `.env.local` file is required to run the current app.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run the TypeScript compiler without emitting files. |

## Tech stack

- React 19 and TypeScript
- Vite
- Tailwind CSS 4
- Lucide icons
- Motion

## Keyboard shortcuts

- `N` — open the new-task dialog (when focus is not in an input).
- `Ctrl+S` / `Cmd+S` — open the sync and backup panel.
