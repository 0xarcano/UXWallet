```markdown
# Context-as-Code: The AI-Ready Project Standard

## 📖 Overview
This project implements a **Context-as-Code** architecture. It is designed to maximize the efficiency, code quality, and security of AI coding assistants (Cursor, Claude Code, GitHub Copilot) by providing structured, hierarchical knowledge.

Instead of prompting the AI repeatedly with the same context, we treat project documentation, architectural decisions, and coding standards as part of the codebase.

## 📂 Directory Structure
The core of this system lives in the `.context/` folder (sometimes aliased as `.ai/` or `docs/ai/`).

```text
root/
├── .cursorrules               # The "Router" that points Cursor to the context
├── .context/
│   ├── 00_meta/               # AI Persona and Role definitions
│   ├── 01_product/            # WHAT we are building (PRD, User Stories)
│   ├── 02_architecture/       # HOW it is structured (Diagrams, Patterns)
│   ├── 03_standards/          # GENERAL Rules (Naming, Git, Code Style)
│   ├── 04_tech_stack/         # SPECIFIC Tooling (React, Solidity, Python)
│   ├── 05_security/           # Safety Guidelines (OWASP, Reentrancy)
│   └── 06_testing/            # QA Strategy (Unit, Integration, E2E)

```

---

## 🚀 How to Use This Standard

### 1. Installation

Copy the `.context/` folder and the `.cursorrules` file into the root of your new project.

### 2. The Setup Phase (Human Work)

Before writing code, fill out the **Project Specific** files. The AI needs this "ground truth" to function correctly.

* **Edit `01_product/prd.md**`: Define the problem, solution, and core features.
* **Edit `01_product/domain_glossary.md**`: Define your specific terminology (e.g., "Vault," "Mint," "Epoch").
* **Edit `02_architecture/system_design.md**`: Define your layers (Clean Arch, MVC, etc.).

### 3. Integration with AI

* **Cursor:** The `.cursorrules` file automatically instructs Cursor to index `.context`. No action needed.
* **Claude Code / ChatGPT:** When starting a new session, attach the relevant context files or use a system prompt like:
> "Follow the instructions in @.cursorrules to get the project context."



---

## 🛠 How to Specialize (Customization Guide)

This structure is designed to be 80% reusable and 20% specialized. Here is how to adapt it for different domains.

### Scenario A: Web3 / Blockchain Project

* **02_architecture:** Add `smart_contract_layout.md` (e.g., Diamond Pattern, Proxy Pattern).
* **04_tech_stack:**
* Create `solidity_style.md` or `rust_stylus.md`.
* Define rules for **Foundry/Hardhat** in `framework_best_practices.md`.


* **05_security:**
* **CRITICAL:** Create `web3_security.md`. Include checks for Reentrancy, Oracle manipulation, and Access Control.


* **06_testing:**
* Update `testing_tools.md` to prioritize Fuzzing and Invariant testing (e.g., using `forge test`).



### Scenario B: AI / Data Science Project

* **03_standards:**
* Update `coding_style.md` to prefer PEP8 (Python) guidelines.


* **04_tech_stack:**
* Create `python_best_practices.md` (typing, list comprehensions).
* Create `ml_frameworks.md` (PyTorch/TensorFlow specific patterns).


* **05_security:**
* Add `data_privacy.md`. Focus on PII sanitization before training and model serialization security (pickling risks).


* **06_testing:**
* Update strategy to include data validation tests (Great Expectations) and model performance regression tests.



### Scenario C: Modern Web2 (SaaS)

* **02_architecture:** Define API contract styles (REST vs GraphQL) in `api_design.md`.
* **04_tech_stack:**
* Focus on **Next.js/React** or **Vue/Nuxt** rules.
* Define State Management patterns (Zustand, Redux, Context).


* **05_security:**
* Focus on OWASP Top 10 (CSRF, XSS, SQLi).



---

## 🔄 Maintenance & Evolution

1. **Treat Context as Code:** If the architecture changes, update `02_architecture` in the same PR as the code change.
2. **Refactor Rules:** If the AI consistently makes the same mistake, add a rule to `03_standards` or `04_tech_stack` to prevent it explicitly.
3. **Global Updates:** If you run multiple projects, keep a "Master Template" repo. When you update `03_standards/coding_style.md` (Universal rules), pull those changes into all your active projects.

## 📝 License

MIT License - Free to use and modify for any personal or commercial project.