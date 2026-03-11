<div align="center">
  <img src="public/logo.png" alt="AeroVital Navigator Logo" width="120" />
  <h1>🌬️ AeroVital Navigator</h1>
  <p><strong>Official Submission for India Innovate 2026</strong></p>
  <p><strong>A True Pathway Reactive Baby Dragon Hatchling (BDH) Platform with Deep Research RAG & Neural Routing</strong></p>
  
  [![Pathway Streaming](https://img.shields.io/badge/Architecture-Pathway_Reactive_Stream-0054a6.svg)](https://pathway.com)
  [![Deep Research RAG](https://img.shields.io/badge/AI-Deep_Research_RAG-blueviolet.svg)](#)
  [![Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg)](#)
</div>

## 🇮🇳 India Innovate 2026: The Mission

Air pollution costs the global economy $8.1 trillion annually, with Indian cities often bearing the brunt of this crisis. Existing navigation apps focus solely on distance and traffic, completely ignoring the physiological impact of a route on the user's health. 

**AeroVital Navigator** bridges this massive gap by providing **preventative, dynamic Bio-Routing** specifically tailored for environmentally sensitive populations, daily commuters, and fitness enthusiasts in India. This platform is our flagship submission for **India Innovate 2026**, built to demonstrate how real-time AI can actively save lives.

---

## 🧬 Core Architecture: True Pathway Streaming

AeroVital Navigator is not a standard web application; it is built on a **Strict Pathway Streaming Architecture**. It rigorously adheres to the principle that data must *react automatically* when new external telemetry arrives, mapping Continuous IoT Atmospheric Data directly to Next.js without databases or manual polling.

- **Continuous Python Generators:** Natively connects to real-time global weather and AQI parameters from CPCB (Central Pollution Control Board) and WAQI.
- **Asynchronous Deep Research RAG:** Integrates Gemini's architecture directly into the Pathway DAG, enabling instantaneous context-aware Deep Research responses.
- **Live NASA FIRMS Integration:** Real-time satellite biomass burning and fire alerts mapped directly to the local ward level.
- **Multi-Language RAG Support:** Chat intelligently answers any deep-research health query, dynamically translated to regional Indian languages.

---

## 💡 Innovation & Unique Approach

To assist the **India Innovate 2026** evaluators and judges, here is the core value proposition of AeroVital Navigator:

1. **Context-Aware Bio-Routing (A* Neural Intelligence):** We invert navigation. The app prioritizes lung health over arrival time, offering routes that bypass high-AQI industrial zones or acute environmental hazards.
2. **Gemini 1.5 Pro GenAI Fitness Coach:** Our routing engine actively communicates with Gemini LLMs, piping in millisecond-live Atmospheric data (AQI, Temperature) and user medical histories (Asthma, Cardiovascular conditions) to calculate safe exertion levels.
3. **Baby Dragon Hatchling (BDH) Integration**: Utilizing a biologically inspired framework, this platform formalizes a bridge between neural computation and machine-based language understanding for robust, hallucination-free AI reasoning.
4. **Enterprise Edge Security:** Fully protected by Vercel Edge Headers against Clickjacking, MIME-sniffing, and XSS attacks—ensuring production-grade safety from day one.

---

## 🚀 Ultimate Features

### **🧠 Pathway Post-Transformer Intelligence**
-   **Pathway Deep Brain**: A real-time neural intelligence panel that processes atmospheric toxicity against medical history for 1-sentence actionable reasoning.
-   **Ward Intelligence Engine**: Inverse-Distance Weighting (IDW) spatial interpolation maps 39 Delhi monitoring stations to 272 MCD wards dynamically.

### **👁️ Gemini 1.5 Flash & Pro Integration**
-   **Medical Document Scanning**: Upload health reports (Images/PDFs) during onboarding for instant AI-driven profile sync using OCR.
-   **AI Camera Pollution Scan**: AR Shield overlay that uses device optics to detect haze visibility and estimate PM2.5 sources conceptually.

### **🛡️ 100% Online Data Integrity**
-   **Multi-API Fallback**: Prioritizes Pathway live streams but automatically falls back to Open-Meteo and simulated telemetry if backends go offline. **Zero-data gaps.**

---

## 📁 Repository Structure & File Organization

The project strictly follows the Next.js App Router paradigm, ensuring clean separation of concerns:

- `src/app/` - Contains the Next.js page routes, layouts, and global CSS.
- `src/components/` - Highly modular, reusable React functional components (Dashboard, Map, Fitness, News, Camera).
- `src/lib/` - Shared utilities, API clients, and the core `wardDataService.ts` intelligence logic.
- `src/stores/` - Global state management utilizing Zustand (Profile data, Map states, Atmosphere).
- `public/` - Static assets, icons, and manifesting for the PWA configuration.

---

## 🏗️ Tech Stack

### **Frontend**
-   Next.js 15+ (App Router)
-   React 19, Tailwind CSS (Vanilla Flexibility)
-   Framer Motion (Premium Animations)
-   Deck.gl & React-Map-GL (3D Globe & Maps)
-   Zustand (State Management)
-   Lucide React (Icons)

### **Intelligence & Backend**
-   **Google Gemini 1.5 Series** - Live JSON generation, text embedding, and OCR.
-   **Pathway** - Streaming RAG & Backend Engine.
-   **Groq LLaMA 3** - Ultra-fast inference fallback.
-   **Open-Meteo, WAQI, NASA FIRMS** - Live Environment, Routing, and Satellite data.

---

## 🏗️ Getting Started

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/soumoditt-source/aerovital-navigator.git
    cd aerovital-navigator
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and add your required keys (Gemini API & WAQI Token are vital):
    ```bash
    cp .env.example .env.local
    ```

3.  **Launch Dashboard**:
    ```bash
    npm run dev
    ```

---

## 🤝 Contributing & Community

Please review our [CODE OF CONDUCT](CODE_OF_CONDUCT.md) and [CONTRIBUTING](CONTRIBUTING.md) guidelines before proposing pull requests. 

## 📄 License & Credits

**Architected and developed exclusively for India Innovate 2026 by:**
**Soumoditya Das** (Team Full Stack Shinobi)
📧 [soumoditt@gmail.com](mailto:soumoditt@gmail.com)

This project is licensed under the [MIT License](LICENSE). Copyright © 2026.
