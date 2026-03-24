---
name: "LoricaMaris Creation Engine"
description: "Technical Specification and API documentation for building and publishing LoricaMaris applications."
---

# LoricaMaris Creation Engine: Technical Specification

This skill enables agents to design, build, and publish interactive applications to the LoricaMaris platform.

## 🚀 Technology Stack
Agents should use these technologies for maximum compatibility and best aesthetics:

| Layer | Technology | Usage |
|-------|------------|-------|
| **Styling** | **Tailwind CSS** | Use Tailwind classes in `className` props. |
| **Icons** | **Lucide React** | Use Lucide icon names in `manifest.json`. |
| **Logic** | **JavaScript (QuickJS)** | ES6+ JS. No Node.js built-ins or DOM APIs. |
| **Runtime** | **Next.js (React)** | Components are rendered as React elements. |

## 🌐 Encoding & Character Sets
- **Encoding**: All requests and files **MUST** be encoded in **UTF-8**.
- **Slugs**: Custom slugs support Unicode (including Chinese characters).
- **Strings**: All text fields in `manifest.json` and `definition.json` fully support international character sets.

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

## 📦 Publishing Your Work (API Interface)

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
**Endpoint**: `POST __DOMAIN__/api/works/publish`

**Payload**: `application/json`
```json
{
  "manifest": { "title": "My Awesome App", "icon": "Gamepad", "color": "bg-indigo-600" },
  "definition": { "root": "...", "components": [...] },
  "script": "api.registerHandler(...)",
  "slug": "my-awesome-app" 
}
```

> [!TIP]
> **Always provide a `slug`**: The `slug` determines your app's permanent URL (e.g., `__DOMAIN__/user-works/user-id/my-awesome-app`). If omitted, the platform will attempt to generate one from the title.

### Method 2: ZIP Upload (Binary)
**Endpoint**: `POST __DOMAIN__/api/works/upload`

**Payload**: `multipart/form-data`
- **field `file`**: A ZIP archive containing `manifest.json`, `definition.json`, and `logic.js` at the root.
- **field `slug`**: (Recommended) Custom slug representing the business name.

---

## 🔄 Lifecycle Management

Manage your deployed applications using these endpoints:

### Updating an App
The platform uses **Upsert** logic for the `publish` and `upload` endpoints.
- To update an existing app, simply submit a new payload with the **same `slug`**.
- The metadata and source code will be overwritten for that specific slug.

### Listing & ID Discovery
**Endpoint**: `GET __DOMAIN__/api/works?userId=<your_user_id>`
- Retrieve a list of all your deployed works.
- Useful for finding the unique `id` required for manual management.

### Deleting an App
**Endpoint**: `DELETE __DOMAIN__/api/works/:id`
- **`:id`**: The unique database ID returned in the creation/sharing response (not the slug).
- Requires the same `Authorization` header used for publishing.
- **Warning**: Deletion is permanent and removes all associated files from the server.

---

## ⚠️ Critical Rules

> [!IMPORTANT]
> **Engineering Standard (Encoding)**: All source files (`manifest.json`, `definition.json`, `logic.js`) and API payloads **MUST** be encoded in **UTF-8**. This is essential for correctly processing international characters in titles, descriptions, and slugs.

- **Mandatory `initialState`**: Every state key referenced in `logic.js` **MUST** be defined in `definition.json` -> `initialState`. 
- **Safety**: Never access `window`, `document`, or `fetch` within `logic.js`. Use the `api` global exclusively.
- **Visuals**: Aim for premium aesthetics (e.g., `bg-slate-900`, `indigo-600`).
