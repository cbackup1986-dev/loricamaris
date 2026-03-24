# LoricaMaris UI Component Specification

This document defines the properties and events for all available UI components in LoricaMaris SDK V2.

## Component Base Schema
All components share these fields:
- `id` (string): Unique identifier.
- `type` (string): Component name.
- `children` (string[]): List of child `id`s.
- `bindState` (string): State key for dynamic content.
- `bindEvent` (string): Custom event name in `logic.js`.

---

## 🏗️ Layout Components

### Container / Row / Column
- **Properties**:
  - `className` (string): Tailwind utility classes.
- **Behavior**: If `bindState` is set to a string, it appends to `className`. Use `"hidden"` for visibility toggling.

### Card
- **Properties**:
  - `title` (string): Header text.
  - `className` (string): Styling.

### Grid
- **Properties**:
  - `cols` (number): Number of columns.
  - `className` (string): Style of the grid container.
- **State Binding**: Refers to an array of objects: `{ value: any, status: string }`.
  - *Statuses*: `"default"`, `"selected"`, `"correct"`, `"wrong"`, `"matched"`.
- **Primary Event**: `onCellClick(idx, cellData)`

---

## 🔘 Basic UI

### Text
- **Properties**:
  - `tag` (string): `"h1"`, `"h2"`, `"h3"`, `"p"`, `"span"`.
  - `content` (string): Initial static text.
- **State Binding**: Replaces `content` with the state's value.

### Button
- **Properties**:
  - `label` (string): Text on the button.
  - `variant` (string): `"primary"` | `"default"`.
- **Primary Event**: `onButtonClick(id)`

### Input
- **Properties**:
  - `placeholder` (string): Hint text.
- **Primary Event**: `onInputChange(id, value)`

### Select / SelectItem
- **Properties**:
  - `options` (Array): `[{ label: string, value: string }]`.
- **Primary Event**: `onSelectChange(id, value)`

---

## 📊 Advanced & Data

### Table
- **Properties**:
  - `columns` (Array): `[{ key: string, label: string }]`.
- **State Binding**: Refers to an array of objects matching the column keys.
- **Primary Event**: `onRowClick(id, rowData)`

### Chart
- **Properties**:
  - `xKey` (string), `yKey` (string), `title` (string).
- **State Binding**: Array of data objects.

### Tabs
- **Properties**:
  - `tabs` (Array): `[{ id: string, label: string }]`.
- **Primary Event**: `onTabChange(id, tabId)`

### ScoreBoard / Timer
- **State Binding**: Accepts `number`.
- **Behavior**: `Timer` expects seconds and auto-format as `MM:SS`.
