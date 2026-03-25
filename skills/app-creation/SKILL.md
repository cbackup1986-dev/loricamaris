---
name: "LoricaMaris Creation Engine"
description: "Technical Specification and API documentation for building and publishing LoricaMaris applications on __DOMAIN__."
---

# LoricaMaris Creation Engine: Technical Specification

> **⚠️ CRITICAL FOR ALL MODELS (DeepSeek, Kimi, GPT, Claude, etc.)**
> Read the "JSON Encoding Rules" section BEFORE generating any code.

This skill enables agents to design, build, and publish interactive applications to the LoricaMaris platform.

## 🚀 Publishing Applications
Applications are published via the `POST /api/works/publish` endpoint.

### Incremental Updates (NEW)
You can now perform partial updates to your application. If a field is omitted from the JSON body, the existing version on the server will be preserved.
- **Update Logic only**: Send `{"slug": "my-app", "script": "..." }`
- **Update UI only**: Send `{"slug": "my-app", "definition": { ... } }`
- **Update Metadata**: Send `{"slug": "my-app", "manifest": { ... } }`

> [!TIP]
> Always provide either the `slug` or `manifest.title` to identify which application you are updating.

### 📡 请求说明 (Request Specification)
Access all API endpoints using the dynamic identifier `__DOMAIN__`. The server will automatically replace this with the active host (e.g., `https://loricamaris.com`).

---

## 🚨 JSON Encoding Rules (MUST READ FIRST)

These rules exist because **Windows systems and non-UTF-8 terminals cause silent failures**.

### Rule 1 — The `script` field MUST be a single-line JSON string

The `logic.js` content is transmitted as a JSON string value. **Raw newlines inside a JSON string value are ILLEGAL** and will cause a parse error that manifests as garbled output on Windows.

❌ **WRONG** — This will fail with a JSON parse error:
```json
{
  "script": "api.registerHandler('onInit', () => {
    api.updateState({ count: 0 });
  });"
}
```

✅ **CORRECT** — All newlines replaced with `\n`, all quotes escaped:
```json
{
  "script": "api.registerHandler('onInit', () => {\n  api.updateState({ count: 0 });\n});"
}
```

**Practical rule**: When building the JSON payload, always use your language's JSON serializer (e.g., `json.dumps()` in Python, `JSON.stringify()` in JS) — never manually concatenate strings into JSON.

### Rule 2 — Always set Content-Type and Accept-Charset headers

```
Content-Type: application/json; charset=utf-8
Accept-Charset: utf-8
```

### Rule 3 — Python callers must explicitly encode as UTF-8

```python
import json, requests

payload = {
    "manifest": {...},
    "definition": {...},
    "script": script_string,   # plain Python string, json.dumps handles escaping
    "slug": "my-app"
}

response = requests.post(
    "__DOMAIN__/api/works/publish",
    data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    headers={
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer YOUR_TOKEN"
    }
)
```

### Rule 4 — Windows `curl` users must save payload to a UTF-8 file first

```powershell
# Step 1: Save payload as UTF-8 file (NOT GBK/GB2312)
$payload | Out-File -FilePath payload.json -Encoding utf8

# Step 2: Post the file
curl -X POST "__DOMAIN__/api/works/publish" `
  -H "Content-Type: application/json; charset=utf-8" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  --data-binary "@payload.json"
```

---

## 🚀 Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Styling** | **Tailwind CSS** | Use class strings in `className` props |
| **Icons** | **Lucide React** | Use icon name strings in `manifest.json` |
| **Logic** | **JavaScript (Sandbox)** | ES6+, no Node built-ins, no DOM APIs |
| **Runtime** | **Next.js / React** | Components rendered as React elements |

---

## 📐 File Structure

Every app requires exactly three logical fields when using the `/publish` API:

| Field | Type | Description |
|-------|------|-------------|
| `manifest` | object | App metadata |
| `definition` | object | UI layout (JSON) |
| `script` | string | Logic code (**escaped single-line string**) |
| `slug` | string | URL slug (optional, auto-generated from title if omitted) |

---

## 📋 manifest (object)

```json
{
  "title": "My App",
  "description": "What this app does",
  "icon": "Activity",
  "color": "bg-indigo-600",
  "difficulty": "Medium"
}
```

- `icon`: Any valid [Lucide icon name](https://lucide.dev/icons/) as a string, e.g. `"Brain"`, `"Sparkles"`, `"Activity"`
- `color`: A Tailwind background class, e.g. `"bg-indigo-600"`, `"bg-emerald-500"`, `"bg-rose-500"`
- `difficulty`: `"Easy"` | `"Medium"` | `"Hard"`

---

## 📋 definition (object)

```json
{
  "version": "1.0",
  "root": "main",
  "initialState": {
    "count": 0,
    "message": "Hello"
  },
  "components": [
    {
      "id": "main",
      "type": "Container",
      "props": { "className": "p-6 space-y-4" },
      "children": ["title", "counter", "btn"]
    },
    {
      "id": "title",
      "type": "Text",
      "props": { "tag": "h2", "content": "Counter", "className": "text-2xl font-bold" }
    },
    {
      "id": "counter",
      "type": "Text",
      "props": { "tag": "p", "className": "text-4xl font-black text-indigo-500" },
      "bindState": "count"
    },
    {
      "id": "btn",
      "type": "Button",
      "props": { "label": "Increment", "variant": "primary" }
    }
  ]
}
```

### Key rules for `definition`:
- `root`: must match the `id` of one component in `components`
- `initialState`: **every key referenced in `script` via `api.state.X` or `api.updateState({X:...})` MUST be initialized here**
- `bindState`: the string value must exactly match a key in `initialState`
- `children`: array of component `id` strings (parent–child relationship)

---

## 🏗️ UI Component Reference

### Layout
| Type | Key Props | bindState behavior |
|------|-----------|-------------------|
| `Container` | `className` | Appends string state value to className |
| `Row` | `className` | Flex row, same as Container |
| `Column` | `className` | Flex column |
| `Card` | `title`, `className` | Renders titled card box |
| `Grid` | `cols` (number), `className` | Renders array of clickable cells; state must be `{value, status}[]` |

**Grid cell statuses**: `"default"` | `"selected"` | `"correct"` | `"wrong"` | `"matched"`

### Basic UI
| Type | Key Props | Event fired |
|------|-----------|------------|
| `Button` | `label`, `variant` (`"primary"`\|`"default"`) | `onButtonClick(id)` |
| `Input` | `placeholder` | `onInputChange(id, value)` |
| `Select` | `options: [{label, value}]`, `placeholder` | `onSelectChange(id, value)` |
| `Text` | `tag` (`h1`–`h3`, `p`, `span`), `content`, `className` | — |
| `Checkbox` | `label` | `onCheckboxChange(id, checked)` |
| `Radio` | `label`, `value`, `name` | `onRadioChange(id, value)` |

### Data & Advanced
| Type | Key Props | bindState |
|------|-----------|----------|
| `Table` | `columns: [{key, label}]` | Array of row objects |
| `Chart` | `xKey`, `yKey`, `title` | Array of data objects |
| `Tabs` | `tabs: [{id, label}]` | Active tab id string |
| `ScoreBoard` | — | Number |
| `Timer` | — | Number (seconds, shown as MM:SS) |

---

## ⚙️ script — Logic API Reference

The script runs in a sandboxed JS environment. The **only** global available is `api`.

### State
```javascript
api.state                          // read current state (object)
api.updateState({ key: value })    // merge-update state, triggers re-render
api.getState()                     // alias for api.state
```

### Event Handlers
```javascript
// Register a handler for UI events
api.registerHandler('onInit', () => { /* called when app loads */ });
api.registerHandler('onButtonClick', (id) => { /* id = component id */ });
api.registerHandler('onCellClick', (idx, cellData) => { /* idx = array index */ });
api.registerHandler('onInputChange', (id, value) => {});
api.registerHandler('onSelectChange', (id, value) => {});
api.registerHandler('onTabChange', (id, tabId) => {});
api.registerHandler('onRowClick', (id, rowData) => {});
api.registerHandler('onKeyDown', (key) => {});
```

### Utilities
```javascript
api.random(min, max)               // integer between min and max inclusive
api.shuffle(array)                 // returns shuffled copy
api.log(...args)                   // console.log with [Sandbox] prefix
api.wait(ms)                       // returns Promise (use carefully)
api.endGame({ status: "won", score: 100 })  // trigger win/lose overlay
api.vfx.confetti()                 // confetti animation
api.vfx.shake()                    // shake animation
api.storage.save(key, value)       // persist to localStorage
api.storage.load(key)              // load from localStorage

### 🌐 External & DB (Bridge)
```javascript
// External API Fetch
await api.fetch(url, options)      // Safe proxy for fetch (whitelist required)

// Managed Database
await api.db.getRow(key)           // get record from platform DB
await api.db.addRow(key, data)     // create/overwrite record
await api.db.deleteRow(key)        // remove record

### 📊 Virtual Tables (Relational-style)
```javascript
// 1. Create a table with schema
await api.db.createTable('expenses', { 
  amount: 'number', 
  category: 'string' 
});

// 2. Insert data
await api.db.insert('expenses', { amount: 120, category: 'Food' });

// 3. Select with filters
const rows = await api.db.select('expenses', { category: 'Food' });

// 4. Efficient Statistics (Server-side)
const total = await api.db.aggregate('expenses', { sum: 'amount' });
const count = await api.db.aggregate('expenses', { count: true });
```

### ⛔ BLOCKED — These will cause errors if used:
`window`, `document`, `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage` (use `api.storage` instead), `eval`, `Function`, `require`, `process`, `alert`

---

## 📦 Publishing API

### Endpoint: `POST __DOMAIN__/api/works/publish`

**Headers:**
```
Content-Type: application/json; charset=utf-8
Authorization: Bearer YOUR_DEVELOPER_TOKEN   (omit for guest mode)
```

**Body:**
```json
{
  "manifest": {
    "title": "My Counter App",
    "description": "A simple counter",
    "icon": "Activity",
    "color": "bg-indigo-600",
    "difficulty": "Easy"
  },
  "definition": {
    "version": "1.0",
    "root": "main",
    "initialState": { "count": 0 },
    "components": [
      {
        "id": "main",
        "type": "Container",
        "props": { "className": "p-6 flex flex-col gap-4 items-center" },
        "children": ["lbl", "btn"]
      },
      {
        "id": "lbl",
        "type": "Text",
        "props": { "tag": "h2", "className": "text-5xl font-black text-indigo-500" },
        "bindState": "count"
      },
      {
        "id": "btn",
        "type": "Button",
        "props": { "label": "Click me", "variant": "primary" }
      }
    ]
  },
  "script": "api.registerHandler('onInit', () => {\n  api.updateState({ count: 0 });\n});\napi.registerHandler('onButtonClick', (id) => {\n  api.updateState({ count: api.state.count + 1 });\n});",
  "slug": "my-counter"
}
```

**Successful response:**
```json
{
  "success": true,
  "message": "Game published successfully!",
  "data": {
    "slug": "my-counter",
    "title": "My Counter App",
    "url": "__DOMAIN__/user-works/USER_ID/my-counter",
    "gameId": "clxxxxx"
  }
}
```

**Common error responses:**
```json
{ "error": "Invalid JSON body", "hint": "Check for unescaped newlines in 'script'" }
{ "error": "Missing required fields: manifest, script" }
{ "error": "Invalid developer token" }
```

---

## 🔄 Other API Endpoints

### Get your profile / userId
```
GET __DOMAIN__/api/auth/profile
Authorization: Bearer YOUR_TOKEN
```

### List your apps
```
GET __DOMAIN__/api/works?userId=YOUR_USER_ID
```

### Delete an app (by database id, not slug)
```
DELETE __DOMAIN__/api/works/DATABASE_ID
Authorization: Bearer YOUR_TOKEN
```

### Update via ZIP upload
```
POST __DOMAIN__/api/works/upload
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Fields:
  file: <zip containing manifest.json, definition.json, logic.js>
  slug: my-app-slug   (optional)
```

### SDK documentation (dynamic)
```
GET __DOMAIN__/api/sdk/skill
```

---

## 🐍 Complete Python Example

```python
import json
import requests

DOMAIN = "__DOMAIN__"
TOKEN  = "PEAK_your_token_here"   # or omit for guest mode

# --- 1. Build script as a normal Python string ---
script = """
api.registerHandler('onInit', () => {
  const items = [];
  for (let i = 1; i <= 9; i++) {
    items.push({ value: i, status: 'default' });
  }
  api.updateState({ items: items, score: 0 });
});

api.registerHandler('onCellClick', (idx, cellData) => {
  const items = [...(api.state.items || [])];
  items[idx] = { ...items[idx], status: 'selected' };
  api.updateState({ items: items, score: api.state.score + 10 });
  api.vfx.confetti();
});
"""

# --- 2. Build definition as Python dict ---
definition = {
    "version": "1.0",
    "root": "main",
    "initialState": {
        "items": [],    # must match all keys used in script
        "score": 0
    },
    "components": [
        {
            "id": "main",
            "type": "Container",
            "props": {"className": "p-6 space-y-4"},
            "children": ["score_display", "grid"]
        },
        {
            "id": "score_display",
            "type": "ScoreBoard",
            "bindState": "score"
        },
        {
            "id": "grid",
            "type": "Grid",
            "props": {"cols": 3},
            "bindState": "items"
        }
    ]
}

manifest = {
    "title": "Number Tap",
    "description": "Tap the cells to score points",
    "icon": "Grid3X3",
    "color": "bg-indigo-600",
    "difficulty": "Easy"
}

# --- 3. json.dumps handles ALL escaping automatically ---
payload = json.dumps(
    {
        "manifest": manifest,
        "definition": definition,
        "script": script,      # Python multiline string → properly escaped JSON string
        "slug": "number-tap"
    },
    ensure_ascii=False          # keep Chinese/Unicode characters as-is
)

# --- 4. POST with explicit UTF-8 encoding ---
response = requests.post(
    f"__DOMAIN__/api/works/publish",
    data=payload.encode("utf-8"),
    headers={
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": f"Bearer {TOKEN}"
    }
)

result = response.json()
if result.get("success"):
    print("✅ Published:", result["data"]["url"])
else:
    print("❌ Error:", result.get("error"), result.get("hint", ""))
```

---

## 🌐 Complete JavaScript / Node.js Example

```javascript
const DOMAIN = "__DOMAIN__";
const TOKEN  = "PEAK_your_token_here";

const script = `
api.registerHandler('onInit', () => {
  api.updateState({ count: 0, message: 'Ready' });
});
api.registerHandler('onButtonClick', (id) => {
  const newCount = api.state.count + 1;
  api.updateState({
    count: newCount,
    message: newCount >= 10 ? 'You win!' : 'Keep going'
  });
  if (newCount >= 10) api.endGame({ status: 'won', score: newCount * 10 });
});
`;

const payload = {
  manifest: {
    title: "Click Counter",
    description: "Reach 10 clicks to win",
    icon: "MousePointerClick",
    color: "bg-violet-600",
    difficulty: "Easy"
  },
  definition: {
    version: "1.0",
    root: "main",
    initialState: { count: 0, message: "Ready" },
    components: [
      {
        id: "main",
        type: "Container",
        props: { className: "p-8 flex flex-col items-center gap-6" },
        children: ["msg", "cnt", "btn"]
      },
      { id: "msg", type: "Text", props: { tag: "p" }, bindState: "message" },
      { id: "cnt", type: "Text", props: { tag: "h1", className: "text-6xl font-black text-violet-500" }, bindState: "count" },
      { id: "btn", type: "Button", props: { label: "Click!", variant: "primary" } }
    ]
  },
  script,   // JS template literal: JSON.stringify handles \n escaping automatically
  slug: "click-counter"
};

// JSON.stringify automatically escapes newlines in string values
const response = await fetch(`__DOMAIN__/api/works/publish`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": `Bearer ${TOKEN}`
  },
  body: JSON.stringify(payload)
});

const result = await response.json();
if (result.success) {
  console.log("✅ Published:", result.data.url);
} else {
  console.error("❌ Error:", result.error, result.hint ?? "");
}
```

---

## ⚠️ Critical Rules Summary

| Rule | Detail |
|------|--------|
| **initialState completeness** | Every `api.state.X` or `api.updateState({X})` key in script must exist in `initialState` |
| **No DOM APIs** | Never use `window`, `document`, `fetch` in script |
| **JSON serializer only** | Never manually build the JSON payload string; use `json.dumps` / `JSON.stringify` |
| **UTF-8 encoding** | Always encode the request body as UTF-8, especially on Windows |
| **slug format** | Letters, numbers, hyphens only; Unicode letters allowed; auto-generated if omitted |
| **script is a string** | The `script` field value is a string, not an object or code block |
| **One root component** | `definition.root` must match exactly one `id` in `components` |
| **children are id strings** | `children: ["id1", "id2"]` — string array of component ids, not nested objects |
| **External Whitelist** | For `api.fetch`, domains must be whitelisted by the platform owner |
| **DB is Isolated** | `api.db` is isolated per application; you cannot access other apps' data |
