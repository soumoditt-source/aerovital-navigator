# 🌬️ AeroVital Navigator v3.0 ULTIMATE - AI-Powered Atmospheric Health Protection

> **Built by Soumoditya Das (`soumoditt@gmail.com`)**

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![Pathway](https://img.shields.io/badge/Backend-Pathway-orange) ![PWA](https://img.shields.io/badge/PWA-Ready-green) ![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

**AeroVital Navigator** is a cutting-edge, production-ready Progressive Web App (PWA) for real-time atmospheric health protection. It combines live AQI streams with personalized health profiles, multi-model AI assistance, and emergency response features to safeguard users from environmental hazards.

---

## 🚀 v3.0 ULTIMATE Features

### **🎯 Core Features**
*   **Real-Time Dashboard**: Live monitoring of AQI, PM2.5, Temperature, and Humidity with auto-refresh
*   **Interactive Mapping**: Leaflet-based maps with heatmap overlays and location tracking
*   **Personalized Risk Assessment**: Health risk calculations based on user profiles (cardiovascular, respiratory, metabolic)
*   **Intelligent Routing**: Find the **Safest**, **Fastest**, or **Greenest** path with pollution exposure metrics

### **🤖 Multi-Model AI Assistant (NEW)**
*   **Pathway RAG**: Real-time streaming AI with context-aware responses
*   **Google Gemini Pro**: Free, powerful AI for health analysis (API key optional)
*   **Groq LLaMA**: Ultra-fast inference for instant responses
*   **Local AI**: 100% offline mode with intelligent fallback
*   **Model Switching**: Seamlessly switch between AI models in-app
*   **Context-Aware**: Automatically includes current AQI, user health data, and location

### **📱 Progressive Web App (NEW)**
*   **Installable**: Add to home screen on mobile/desktop
*   **Offline Support**: Full functionality without internet connection
*   **Push Notifications**: Real-time pollution spike alerts
*   **Background Sync**: Automatic data synchronization
*   **App-Like Experience**: Native app feel with smooth transitions

### **🚨 Emergency Features (NEW)**
*   **SOS Button**: One-tap emergency alert with GPS location
*   **Health Status Sharing**: Automatically shares current AQI and health metrics
*   **Emergency Contacts**: Quick access to emergency services (112)
*   **Location Sharing**: Real-time GPS coordinates via Google Maps link

### **📊 Health Data Management (NEW)**
*   **PDF Reports**: Professional medical-grade health reports
*   **CSV Export**: Download exposure history for analysis
*   **Social Sharing**: Share health status with doctors/family
*   **Historical Tracking**: Monitor long-term pollution exposure

### **🗺️ Advanced Route Planning (NEW)**
*   **Custom Route Drawing**: Draw your exact commute path on the map
*   **Exposure Calculator**: Real-time pollution exposure calculation (AQI·minutes)
*   **Risk Assessment**: Visual indicators for high-risk routes
*   **Distance & Time**: Automatic calculation of route metrics
*   **Alternative Suggestions**: Recommends safer routes when exposure is high

### **🏋️ Existing Features**
*   **Armor Core Fitness**: 30-day adaptive fitness program based on air quality
*   **Global Intel Feed**: Live news and environmental alerts
*   **Neural Orientation**: Interactive tutorial system for new users
*   **Voice Commands**: Hands-free operation with Web Speech API

---

## 🛠️ Tech Stack

### **Frontend**
*   Next.js 14 (App Router)
*   React 18
*   TypeScript
*   Tailwind CSS
*   Framer Motion (animations)
*   Leaflet + React-Leaflet (maps)
*   Leaflet Draw (route drawing)

### **State Management**
*   Zustand (global state)
*   SWR (data fetching)

### **AI & Backend**
*   **Pathway** (Python) - Real-time streaming AI
*   **Google Gemini Pro** - Free AI API
*   **Groq** - Ultra-fast LLM inference
*   Local AI fallback

### **PWA & Offline**
*   Service Workers
*   Cache API
*   Web Push API
*   IndexedDB (future)

### **Data Sources**
*   WAQI (World Air Quality Index)
*   Open-Meteo API
*   OpenWeather API
*   Google Gemini AI

### **Export & Reporting**
*   jsPDF (PDF generation)
*   jsPDF-AutoTable (tables)
*   Chart.js (visualizations)

---

## 🏗️ Getting Started

### Prerequisites

*   Node.js 18+
*   Google Colab (for Pathway backend) OR API keys for Gemini/Groq

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

3.  **Configure Environment** (Optional):
    Create `.env.local` in the root directory:
    ```env
    # Pathway Backend (if running locally)
    NEXT_PUBLIC_PATHWAY_API_URL=http://localhost:8001

    # AI API Keys (Optional - app works without these)
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
    NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here

    # Push Notifications (Optional)
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
    ```

    **Note**: The app works perfectly without any API keys! It will use:
    - Local AI mode for chat (no API needed)
    - WAQI demo API for air quality data
    - All features remain functional

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000)

5.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

---

## 🚀 Deployment

### **Vercel (Recommended - 100% Free)**

1.  Push code to GitHub
2.  Import project in [Vercel](https://vercel.com)
3.  Add environment variables (optional)
4.  Deploy!

**Vercel automatically handles**:
- PWA manifest serving
- Service worker caching
- Edge functions
- Automatic HTTPS
- Global CDN

### **Other Platforms**

Works on any Node.js hosting:
- Netlify
- Railway
- Render
- AWS Amplify
- Google Cloud Run

---

## 📱 PWA Installation

### **Mobile (Android/iOS)**

1.  Open the app in Chrome/Safari
2.  Tap the "Install App" prompt
3.  Or use browser menu → "Add to Home Screen"
4.  Launch from home screen like a native app!

### **Desktop (Chrome/Edge)**

1.  Click the install icon in the address bar
2.  Or use the in-app "Install" button
3.  App appears in your applications folder

---

## 🔔 Push Notifications Setup

1.  **Enable in-app**: Click the notification bell icon
2.  **Grant permission**: Allow notifications when prompted
3.  **Automatic alerts**: Receive pollution spike warnings even when app is closed

**No backend required!** Notifications work client-side using Service Workers.

---

## 🤖 AI Models Guide

### **Pathway RAG** (Default)
- **Best for**: Real-time streaming responses
- **Requires**: Pathway backend running (Google Colab or local)
- **Fallback**: Automatically switches to Gemini if unavailable

### **Gemini Pro** (Recommended)
- **Best for**: Comprehensive health analysis
- **Requires**: Free Google AI Studio API key
- **Get key**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### **Groq LLaMA**
- **Best for**: Ultra-fast responses (< 1 second)
- **Requires**: Free Groq API key
- **Get key**: [https://console.groq.com](https://console.groq.com)

### **Local AI** (Always Available)
- **Best for**: 100% offline operation
- **Requires**: Nothing!
- **Features**: Rule-based intelligent responses using current AQI data

---

## 📊 Feature Comparison

| Feature | v2.0 | v3.0 ULTIMATE |
|---------|------|---------------|
| PWA Support | ❌ | ✅ |
| Offline Mode | ❌ | ✅ |
| Push Notifications | ❌ | ✅ |
| Multi-Model AI | ❌ | ✅ (4 models) |
| Emergency SOS | ❌ | ✅ |
| Health PDF Export | ❌ | ✅ |
| Route Drawing | ❌ | ✅ |
| Exposure Calculator | ❌ | ✅ |
| Install to Home Screen | ❌ | ✅ |
| Background Sync | ❌ | ✅ |

---

## 🎯 Usage Examples

### **1. Check Air Quality**
```
Open app → Dashboard → View live AQI, PM2.5, Temperature
```

### **2. Plan Safe Route**
```
Dashboard → Click "Draw Route" → Draw path on map → See exposure calculation
```

### **3. Export Health Report**
```
Dashboard → "Export Health Data" → Click "PDF Report" → Share with doctor
```

### **4. Emergency Alert**
```
Click red SOS button → Confirm → Shares location + health status
```

### **5. Switch AI Model**
```
Open Chat → Click model dropdown → Select Gemini/Groq/Local
```

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build test
npm run build

# Type check
npx tsc --noEmit
```

---

## 📄 License

MIT License - feel free to use for personal or commercial projects!

---

## 🙏 Acknowledgments

*   **Pathway** - Real-time streaming AI framework
*   **Google Gemini** - Free, powerful AI API
*   **Groq** - Ultra-fast LLM inference
*   **WAQI** - Global air quality data
*   **Leaflet** - Open-source mapping
*   **Next.js** - React framework
*   **Vercel** - Free hosting

---

## 📞 Contact & Support

**Developer**: Soumoditya Das  
**Email**: soumoditt@gmail.com  
**GitHub**: [Your GitHub Profile]

For bugs or feature requests, please open an issue on GitHub.

---

## 🔮 Roadmap

- [ ] Wearable device integration (Fitbit, Apple Watch)
- [ ] Social features (share routes, community reports)
- [ ] 3D pollution visualization
- [ ] Multi-language support (Hindi, Bengali, Tamil)
- [ ] Predictive AI (forecast pollution 6 hours ahead)
- [ ] Gamification (points, badges, leaderboards)

---

**Made with ❤️ for a healthier planet**

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
