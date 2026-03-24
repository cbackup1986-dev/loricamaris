# LoricaMaris Publishing Guide

## 📦 Deployment Method: ZIP Upload (BEST)

The most reliable way to publish is to create a ZIP containing exactly **3 files** and send it to the upload endpoint.

### 1. File Structure (MANDATORY)
- `manifest.json`: App metadata.
- `definition.json`: UI structure.
- `logic.js`: Game script.
*(All files MUST be UTF-8 encoded)*

### 2. Node.js Upload Script
```javascript
const fs = require('fs');
const AdmZip = require('adm-zip'); // npm install adm-zip

async function publish() {
  const zip = new AdmZip();
  zip.addLocalFile('manifest.json');
  zip.addLocalFile('definition.json');
  zip.addLocalFile('logic.js');
  
  const formData = new FormData();
  formData.append('file', new Blob([zip.toBuffer()]), 'app.zip');

  const res = await fetch('__DOMAIN__/api/games/upload', {
    method: 'POST',
    // headers: { 'Authorization': 'Bearer <token>' }, // Optional
    body: formData
  });
  console.log(await res.json());
}
publish();
```

## 🛠️ API Reference

- **Upload ZIP**: `POST __DOMAIN__/api/games/upload`
- **JSON Publish**: `POST __DOMAIN__/api/games/publish`
  - Body: `{ manifest, definition, script }`
- **Delete App**: `DELETE __DOMAIN__/api/games/publish?slug=<slug>`

> [!CAUTION]
> **Windows/PowerShell**: Avoid using multiline `curl` commands with string interpolation, as they often mangle JSON or encoding. Stick to the Node.js script for deployment.
