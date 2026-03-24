# A2UI & OpenClaw: Agent-Generated UI Guide

This guide explains how to use **OpenClaw** (or any LLM agent) to automatically generate and publish interactive applications on the LoricaMaris platform (`https://135920.xyz/`).

## 🛰️ How A2UI Works

A2UI (Agent-to-UI) is the process where an AI agent translates a high-level user request into a functional, sandboxed application.

> [!IMPORTANT]
> **Dynamic SDK Hook**: Agents should always fetch the latest SDK grammar before starting generation by calling `GET https://135920.xyz/api/sdk/skill`. This ensures the agent uses the most up-to-date syntax and component sets.

1.  **Request**: User asks "Build me a system monitoring dashboard."
2.  **Audit**: Agent fetches the SDK specification via the Dynamic API.
3.  **Generation**: OpenClaw generates `manifest.json`, `definition.json`, and `logic.js`.
4.  **Synthesis**: The agent packages these files into a ZIP archive.
5.  **Deployment**: The agent uses the `upload` API to push the ZIP to **`https://135920.xyz/api/games/upload`**.
6.  **Result**: The platform returns a live URL (e.g., `https://135920.xyz/user-works/guest/peak-pulse`).

## 📝 Example OpenClaw Interaction

### 1. The Prompt
> "Using the LoricaMaris skill, create a dashboard called 'Peak Pulse' that shows system uptime and traffic history using a Line Chart. Set the theme to indigo. Once generated, publish it to my account."

### 2. The Agent's Output (Internal)
The agent generates the files following the [SDK Specification](../skills/game-creation/SKILL.md).

### 3. The Deployment Command
OpenClaw executes a tool call to publish the app to the live platform:
```javascript
// OpenClaw publishes via the zip upload endpoint
const res = await fetch('https://135920.xyz/api/games/upload', {
  method: 'POST',
  body: formData // containing app.zip
});
```

## 💎 Real-world Demo
Check out the **[Peak Pulse Example](../examples/a2ui-demo/)** for a reference implementation of an A2UI-generated dashboard.

## 🔗 Dynamic Skill API Endpoints

Agents can pull specific documentation sections programmatically from the live domain:
- **Main SDK Reference**: `https://135920.xyz/api/sdk/skill`
- **UI Component Set**: `https://135920.xyz/api/sdk/skill/components`
- **Logic Templates**: `https://135920.xyz/api/sdk/skill/templates`
- **Publishing API**: `https://135920.xyz/api/sdk/skill/publish`

## 🤖 Autonomous Development Loop (Self-Healing)

Agents use the Dynamic API on **`https://135920.xyz`** to achieve "Self-Healing" development. If a platform update introduces new components or changes the logic API, the agent follows this loop:

1.  **Monitor**: Periodic check of `https://135920.xyz/api/sdk/skill` for version changes.
2.  **Learn**: Pull the latest `skill-components.md` to discover new UI capabilities.
3.  **Generate**: Develop a small game (e.g., "Space Evader" or "Task Tracker") based on the fresh grammar.
4.  **Validate**: Publish to the platform and verify rendering.

---

### Best Practices for Agents
- **Defensive State**: Always initialize `initialState` to avoid rendering crashes.
- **Tailwind Brilliance**: Use modern Tailwind palettes (e.g., `bg-indigo-600`, `text-slate-100`) for premium aesthetics.
- **Micro-interactions**: Use `api.vfx.confetti()` or `api.vfx.shake()` to make the UI feel alive.
