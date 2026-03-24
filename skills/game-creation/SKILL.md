---
name: LoricaMaris App Creation
description: Technical Specification for building LoricaMaris apps using SDK V2.
---

# LoricaMaris App Creation: Technical Specification

This document defines the rigid syntax, structural rules, and technology stack for LoricaMaris apps.

## 🚀 Technology Stack
Agents should use these technologies for maximum compatibility and best aesthetics:

| Layer | Technology | Usage |
|-------|------------|-------|
| **Styling** | **Tailwind CSS** | Use Tailwind classes in `className` props (e.g., `bg-blue-500`, `flex`, `gap-2`). |
| **Icons** | **Lucide React** | Use Lucide icon names in `manifest.json` and component `props.icon` (e.g., `Brain`, `Heart`, `Settings`). |
| **Logic** | **JavaScript (QuickJS)** | ES6+ JS. No Node.js built-ins or DOM APIs. |
| **Runtime** | **Next.js (React)** | Components are rendered as React elements. |

> [!TIP]
> **Dynamic API Reference**: For the most up-to-date SDK documentation, agents should fetch the following endpoints:
> - **Main Specification**: `GET https://135920.xyz/api/sdk/skill`
> - **Component Library**: `GET https://135920.xyz/api/sdk/skill/components`
> - **Logic Templates**: `GET https://135920.xyz/api/sdk/skill/templates`

---

## 1. Directory Structure & Roles
An app consists of three interconnected files:

| File | Type | Specification |
|------|------|---------------|
| `manifest.json` | JSON | Metadata: `{ "title": string, "icon": LucideName, "color": TailwindBG, "difficulty": string }` |
| `definition.json` | JSON | UI Schema: `{ "version": "1.0", "root": string, "initialState": object, "components": ComponentDef[] }` |
| `logic.js` | JS (QuickJS) | Logic: Sandboxed JavaScript using the `api` global. |

---

## 2. Component Grammar
UI components are strictly defined. See the [Category Map](./skill-components.md) for full property lists.

### Critical State Rules
> [!IMPORTANT]
> **Mandatory `initialState`**: Every state key referenced in `logic.js` (e.g., `api.state.score`) **MUST** be defined in `definition.json` -> `initialState`. 

---

## 3. Best Practices (A2UI)
- **Visuals**: Use `bg-slate-900` or `indigo-600` for premium backgrounds.
- **Safety**: Never access `window`, `document`, or `fetch`.
- **Logic**: Use `api.updateState` for all data changes.

---

## 4. Debugging & References
- 🟢 **UI COMPONENTS**: `__DOMAIN__/skills/game-creation/skill-components.md`
- 🟡 **SCENE TEMPLATES**: `__DOMAIN__/skills/game-creation/skill-templates.md`
- 🔴 **PUBLISH GUIDE**: `__DOMAIN__/skills/game-creation/skill-publish.md`
