# LoricaMaris Scene Templates

Use these structures as a starting point. Ensure all logic patterns follow the SDK Specification.

### Scene A — Grid Game Pattern (Memory/Sudoku)
**Strategy**: Initialize 100% of keys in `initialState`.

- **definition.json**:
```json
{
  "initialState": { "board": [], "moves": 0, "status": "Ready" }
}
```

- **logic.js**:
```javascript
// Pattern: Setup in onInit, guard in handlers
api.registerHandler('onInit', () => {
  const cells = Array(16).fill(null).map((_, i) => ({ value: i+1, status: "default" }));
  api.updateState({ board: api.shuffle(cells), moves: 0 });
});

api.registerHandler('onCellClick', (idx, cellData) => {
  const board = [...(api.state.board || [])];
  if (!board[idx]) return; 

  board[idx].status = "selected";
  api.updateState({ board, moves: api.state.moves + 1 });
});
```

### Scene B — Dashboard Pattern (Analytics)
**Strategy**: Use `initialState` for most data.

- **definition.json**:
```json
{
  "initialState": {
    "stats": [ { "label": "Revenue", "value": "$12k" } ],
    "chart": [ { "month": "Jan", "val": 100 } ]
  }
}
```

- **logic.js**:
```javascript
api.registerHandler('onInit', () => {
  api.log("Dashboard Loaded");
});
```

### Scene C — CRUD / Form Pattern (Management)
**Strategy**: Toggle `hidden` class via state.

- **logic.js**:
```javascript
api.registerHandler('onTabChange', (id, tabId) => {
  api.updateState({ 
    activeTab: tabId,
    formHidden: tabId === "view" ? "hidden" : "",
    listHidden: tabId === "add" ? "hidden" : "" 
  });
});
```

> [!TIP]
> **Strict Syntax**: Do not redeclare `api`. Access current values via `api.state.propertyName`. Define everything in `initialState`.
