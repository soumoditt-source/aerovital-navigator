# 🔑 API Keys Setup Guide - AeroVital Navigator v3.0

## 🎯 Important: API Keys Are OPTIONAL!

**The app works perfectly without any API keys!** It will automatically use:
- ✅ **Local AI mode** for chat (no API needed)
- ✅ **WAQI demo API** for air quality data
- ✅ **All features remain functional**

API keys only enhance the experience with more powerful AI models.

---

## 🤖 AI Model API Keys (Optional)

### 1. Google Gemini Pro (Recommended - FREE)

**Why**: Most powerful free AI, excellent for health analysis

**Get Your Key**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

**Add to `.env.local`**:
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...your_key_here
```

**Free Tier**:
- ✅ 60 requests per minute
- ✅ Unlimited usage
- ✅ No credit card required

---

### 2. Groq (Ultra-Fast - FREE)

**Why**: Fastest LLM inference (< 1 second responses)

**Get Your Key**:
1. Go to [Groq Console](https://console.groq.com)
2. Sign up (free)
3. Go to API Keys → Create New Key
4. Copy the key

**Add to `.env.local`**:
```env
NEXT_PUBLIC_GROQ_API_KEY=gsk_...your_key_here
```

**Free Tier**:
- ✅ 30 requests per minute
- ✅ Fast inference
- ✅ No credit card required

---

### 3. Pathway Backend (Advanced - Optional)

**Why**: Real-time streaming AI with RAG capabilities

**Setup Options**:

#### Option A: Google Colab (Free)
1. Open the Pathway notebook in Google Colab
2. Run all cells
3. Use the ngrok URL provided
4. Add to `.env.local`:
```env
NEXT_PUBLIC_PATHWAY_API_URL=https://your-ngrok-url.ngrok-free.app
```

#### Option B: Local Development
1. Install Pathway: `pip install pathway`
2. Run the backend: `python pathway_backend.py`
3. Add to `.env.local`:
```env
NEXT_PUBLIC_PATHWAY_API_URL=http://localhost:8001
```

---

## 🔔 Push Notifications (Optional)

**Why**: Enable browser push notifications for pollution alerts

**Setup**:
1. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Copy the **Public Key**

3. Add to `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
```

**Note**: The app works without this - notifications will use browser's default system.

---

## 📝 Complete `.env.local` Template

Create this file in your project root:

```env
# ============================================
# AEROVITAL NAVIGATOR - Environment Variables
# ============================================

# -----------------
# AI Models (Optional - app works without these)
# -----------------

# Google Gemini Pro (Free, Recommended)
# Get key: https://makersuite.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=

# Groq LLaMA (Free, Ultra-fast)
# Get key: https://console.groq.com
NEXT_PUBLIC_GROQ_API_KEY=

# Pathway Backend (Optional, Advanced)
# Use Google Colab ngrok URL or local server
NEXT_PUBLIC_PATHWAY_API_URL=

# -----------------
# Push Notifications (Optional)
# -----------------

# VAPID Public Key for push notifications
# Generate: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=

# -----------------
# Notes
# -----------------
# - All variables are optional
# - App works perfectly without any API keys
# - Local AI mode is always available as fallback
# - WAQI demo API is used for air quality data
```

---

## 🚀 Quick Start (No API Keys)

**Just want to test the app?**

1. **Skip all API keys** - don't create `.env.local`
2. **Run the app**: `npm run dev`
3. **Everything works**:
   - ✅ Dashboard with live AQI
   - ✅ Chat with Local AI
   - ✅ Route drawing
   - ✅ Health export
   - ✅ Emergency SOS
   - ✅ PWA features

---

## 🎯 Recommended Setup for Production

### Minimal (Works Great)
```env
# Just Gemini for better AI responses
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### Optimal (Best Experience)
```env
# Gemini for comprehensive analysis
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Groq for ultra-fast responses
NEXT_PUBLIC_GROQ_API_KEY=your_groq_key
```

### Advanced (Full Features)
```env
# All AI models
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_GROQ_API_KEY=your_groq_key
NEXT_PUBLIC_PATHWAY_API_URL=your_pathway_url

# Push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_key
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already configured)
- Use environment variables in Vercel/deployment platform
- Rotate keys periodically
- Use different keys for development and production

### ❌ DON'T:
- Commit `.env.local` to Git
- Share API keys publicly
- Use production keys in development
- Hardcode keys in source code

---

## 🌐 Vercel Deployment

**Adding Environment Variables in Vercel**:

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:
   - **Name**: `NEXT_PUBLIC_GEMINI_API_KEY`
   - **Value**: Your API key
   - **Environment**: Production, Preview, Development
4. Redeploy

---

## 🧪 Testing API Keys

### Test Gemini:
```bash
curl -X POST \
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Test Groq:
```bash
curl -X POST \
  'https://api.groq.com/openai/v1/chat/completions' \
  -H 'Authorization: Bearer YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3-8b-8192","messages":[{"role":"user","content":"Hello"}]}'
```

---

## ❓ Troubleshooting

### "API key not working"
- ✅ Check key is copied correctly (no extra spaces)
- ✅ Verify `.env.local` is in project root
- ✅ Restart dev server after adding keys
- ✅ Check API key hasn't expired

### "Chat not responding"
- ✅ App automatically falls back to Local AI
- ✅ Check browser console for errors
- ✅ Verify API key is valid
- ✅ Try switching to different AI model

### "Push notifications not working"
- ✅ VAPID key is optional
- ✅ Browser must support notifications
- ✅ User must grant permission
- ✅ HTTPS required (works on localhost)

---

## 📊 API Usage Limits

| Service | Free Tier | Rate Limit | Notes |
|---------|-----------|------------|-------|
| **Gemini Pro** | Unlimited | 60 req/min | Best for production |
| **Groq** | Free | 30 req/min | Ultra-fast |
| **WAQI** | Demo | Limited | Used automatically |
| **Pathway** | Self-hosted | Unlimited | Requires setup |

---

## 🎉 You're All Set!

**Remember**: The app works perfectly without any API keys. Add them only if you want:
- More powerful AI responses (Gemini)
- Faster AI responses (Groq)
- Real-time streaming (Pathway)
- Push notifications (VAPID)

**Start coding**: `npm run dev` 🚀

---

## 📞 Need Help?

- **Documentation**: Check README.md
- **Issues**: Open GitHub issue
- **Email**: soumoditt@gmail.com

**Happy coding!** 🌬️
