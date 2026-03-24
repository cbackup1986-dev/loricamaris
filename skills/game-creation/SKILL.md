---
name: "LoricaMaris Game Creation"
description: "Technical Specification and API documentation for building and publishing LoricaMaris apps."
---

# LoricaMaris Game Creation: Technical Specification

This skill enables agents to design, build, and publish interactive apps to the LoricaMaris platform.

## 🚀 Technology Stack
Agents should use these technologies for maximum compatibility and best aesthetics:

| Layer | Technology | Usage |
|-------|------------|-------|
| **Styling** | **Tailwind CSS** | Use Tailwind classes in `className` props. |
| **Icons** | **Lucide React** | Use Lucide icon names in `manifest.json`. |
| **Logic** | **JavaScript (QuickJS)** | ES6+ JS. No Node.js built-ins or DOM APIs. |
| **Runtime** | **Next.js (React)** | Components are rendered as React elements. |

## 📐 Directory Structure
An app consists of three interconnected files:

| File | Type | Specification |
|------|------|---------------|
| `manifest.json` | JSON | Metadata: `{ "title": string, "icon": LucideName, "color": TailwindBG, "difficulty": string }` |
| `definition.json` | JSON | UI Schema: `{ "version": "1.0", "root": string, "initialState": object, "components": ComponentDef[] }` |
| `logic.js` | JS (QuickJS) | Logic: Sandboxed JavaScript using the `api` global. |

---

## 🏗️ UI Component Library
Refer to the dynamic API for full property lists: `GET __DOMAIN__/api/sdk/skill`.

- **Layout**: `Container`, `Card`, `Grid`.
- **Basic UI**: `Text`, `Button`, `Input`, `Select`.
- **Advanced**: `Table`, `Chart`, `Tabs`, `ScoreBoard`, `Timer`.

---

## 📦 Publishing Your App (API Interface)

Agents should choose the most appropriate method based on their available tools (e.g., `fetch`, `curl`).

### Authentication (Mandatory for Production)
To publish apps to your account, you **MUST** include your developer token in the header.
`Authorization: Bearer <DEVELOPER_TOKEN>`

**How to provide it to OpenClaw**:
- **Option A (Preferred)**: Set the `PEAK_TOKEN` or `DEVELOPER_TOKEN` in the environment where OpenClaw is running.
- **Option B**: Provide it as a secret if supported by your runtime.

> [!IMPORTANT]
> Usage without a token will result in **Guest Mode**, where games are temporary and not linked to a persistent account.

### Method 1: JSON Publication (Synchronous)
**Endpoint**: `POST __DOMAIN__/api/games/publish`

**Payload**: `application/json`
```json
{
  "manifest": { "title": "My Awesome Game", "icon": "Gamepad", "color": "bg-indigo-600" },
  "definition": { "root": "...", "components": [...] },
  "script": "api.registerHandler(...)",
  "slug": "my-awesome-game" 
}
```

> [!TIP]
> **Always provide a `slug`**: The `slug` determines your app's permanent URL (e.g., `__DOMAIN__/user-works/user-id/my-awesome-game`). If omitted, the platform will attempt to generate one from the title.

### Method 2: ZIP Upload (Binary)
**Endpoint**: `POST __DOMAIN__/api/games/upload`

**Payload**: `multipart/form-data`
- **field `file`**: A ZIP archive containing `manifest.json`, `definition.json`, and `logic.js` at the root.
- **field `slug`**: (Recommended) Custom slug representing the business name.

---

## ⚠️ Critical Rules
- **Mandatory `initialState`**: Every state key referenced in `logic.js` **MUST** be defined in `definition.json` -> `initialState`. 
- **Safety**: Never access `window`, `document`, or `fetch` within `logic.js`. Use the `api` global exclusively.
- **Visuals**: Aim for premium aesthetics (e.g., `bg-slate-900`, `indigo-600`).
