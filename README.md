# **@obe-loms/coms-parser Documentation**

---

## 🚀 Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Xaidel/loms-client.git
   ```

2. **Create a new branch**

   ```bash
   git branch <branch-name>
   git checkout <branch-name>
   ```

3. **Submit a Pull Request**  
   Open a PR with your changes to the `main` branch.

---

## 📦 Publish

1. **Build the package**  
   Run in the project root:

   ```bash
   npm run prepublishOnly
   ```

2. **Create `package.json` in `/build`**  
   Paste the following JSON:

   ```json
   {
     "name": "@obe-loms/coms-parser",
     "version": "*.*.*", // Update to current version
     "license": "ISC",
     "dependencies": {
       "papaparse": "^5.5.3",
       "rollup-obfuscator": "^4.1.1",
       "tslib": "^2.8.1",
       "xlsx": "^0.18.5"
     },
     "devDependencies": {
       "@rollup/plugin-commonjs": "^28.0.6",
       "@rollup/plugin-node-resolve": "^16.0.1",
       "@rollup/plugin-typescript": "^12.1.4",
       "@types/papaparse": "^5.3.16",
       "rollup": "^4.46.2",
       "ts-node": "^10.9.2",
       "typescript": "^5.9.2"
     },
     "main": "./bundle.js",
     "types": "./main.d.ts",
     "publishConfig": {
       "access": "public"
     }
   }
   ```

3. **Bump the version in `/build`**

   - **Patch** (Bug fixes):
     ```bash
     npm version patch
     ```
   - **Minor** (New features):
     ```bash
     npm version minor
     ```
   - **Major** (Breaking changes):
     ```bash
     npm version major
     ```

4. **Publish to npm**

   ```bash
   npm publish
   ```

---

## 📥 Installation

```bash
npm i @obe-loms/coms-parser
```

---

## 👥 Contributors

- [@Xaidel](https://github.com/Xaidel)
- [@AgeReapor](https://github.com/AgeReapor)
- [@Markrodriguez1105](https://github.com/Markrodriguez1105)
- [@ZA005](https://github.com/ZA005)
- [@UInahd](https://github.com/UInahd)

---
