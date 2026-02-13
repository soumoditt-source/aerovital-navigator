# 🌬️ AeroVital Navigator - AI-Powered Atmospheric Health Protection

> **Built by Soumoditya Das (`soumoditt@gmail.com`)**

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![Pathway](https://img.shields.io/badge/Backend-Pathway-orange) ![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

**AeroVital Navigator** is a cutting-edge real-time navigation and health protection system designed to safeguard users from atmospheric hazards. By integrating live AQI streams with personal health profiles (cardiovascular, respiratory, metabolic), it provides personalized risk assessments and safe route planning.

---

## 🚀 Key Features

*   **Real-Time Dashboard**: Live monitoring of AQI, PM2.5, Temperature, and Humidity.
*   **Personalized Health Risk**: AI-driven analysis of Cardiac, Asthma, and Thyroid risks based on user biology.
*   **Intelligent Routing**: Find the **Safest**, **Fastest**, or **Greenest** path to your destination.
*   **Spike Detection**: Instant alerts for sudden pollution spikes in your area.
*   **Fitness Tracker**: Smart recommendations for outdoor activities based on current atmospheric conditions.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion.
*   **Maps**: Leaflet, React-Leaflet.
*   **State Management**: Zustand (with persistence).
*   **Backend Engine**: [Pathway](https://pathway.com/) (Python) running on Google Colab.
*   **Data Source**: WAQI (World Air Quality Index) & Google Gemini AI.

---

## 🏗️ Getting Started

### Prerequisites

*   Node.js 18+
*   Google Colab (for the backend engine)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/aerovital-navigator.git
    cd aerovital-navigator
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_PATHWAY_API_URL=https://your-ngrok-url.ngrok-free.app
    ```
    *(See `COLAB_SETUP.md` for details on how to get your Pathway URL)*

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add the `NEXT_PUBLIC_PATHWAY_API_URL` environment variable in Vercel settings.
4.  Click **Deploy**.

---

## 👨‍💻 Author & Credits

**Architected and developed by:**
**Soumoditya Das**
📧 [soumoditt@gmail.com](mailto:soumoditt@gmail.com)

*Special thanks to the Pathway team for their incredible streaming engine.*

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
Copyright © 2026 Soumoditya Das.
