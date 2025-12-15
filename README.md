# Hippiekit

Your One-Stop Eco Shop with AI-Powered Product Scanning

## 🌟 New Feature: AI Product Scanning

Hippiekit now includes **AI-powered product recognition** using computer vision! Take a photo of any product and instantly find matching items in the catalog.

### Quick Start

```powershell
cd server/python-ai-service
.\setup.ps1
```

📚 **Full Documentation**: See `GETTING_STARTED.md` for complete setup guide.

## Project Structure

```
hippiekit/
├── client/                  # Vite + React frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── scanService.ts      # AI scanning client
│   │   └── lib/
│   │       └── cameraService.ts    # Camera/gallery integration
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── server/                  # Node.js backend
│   ├── python-ai-service/   # 🆕 AI service with CLIP + Pinecone
│   │   ├── main.py
│   │   ├── models/          # CLIP embedder
│   │   ├── services/        # Pinecone + WordPress
│   │   └── routers/         # Scan + Index endpoints
│   ├── server.ts
│   └── package.json
└── docs/                    # 🆕 Documentation
    ├── AI_SCANNING_SETUP.md
    ├── GETTING_STARTED.md
    ├── ARCHITECTURE.md
    └── QUICK_REFERENCE.md
```

## Getting Started

### Option 1: Quick Start (All Services)

```powershell
# From root directory
.\start-all.ps1
```

This starts:

- ✅ Python AI Service (Port 8001)
- ✅ Node.js Backend (Port 8000)
- ✅ React Client (Port 5173)

### Option 2: Manual Setup

#### 1. Python AI Service

```bash
cd server/python-ai-service
.\setup.ps1
# Add Pinecone API key to .env
python main.py
```

#### 2. Client (Frontend)

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

#### 3. Server (Backend)

```bash
cd server
npm install
npm run dev
```

## Features

### Core Features

- ✅ Onboarding flow (4 screens)
- ✅ Authentication pages (Sign In, Sign Up, Reset Password)
- ✅ OTP Verification
- ✅ Product search and filtering
- ✅ Favorites management
- ✅ User profiles
- ✅ Fluid typography with Tailwind CSS v4
- ✅ Mobile-first design (440px × 990px)
- ✅ Custom fonts (Poppins, Lato, Segoe Print)

### 🆕 AI Features

- ✅ **AI Product Scanning** - Scan photos to find matching products
- ✅ **CLIP Image Embeddings** - State-of-the-art computer vision
- ✅ **Vector Similarity Search** - Find visually similar products
- ✅ **Camera Integration** - Take photos or browse gallery
- ✅ **Real-time Results** - Get matches in ~200-400ms

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Capacitor (Mobile camera/gallery)
- React Router DOM
- React Hook Form + Zod
- shadcn/ui components

### Backend

- Node.js + Express
- TypeScript
- MongoDB/PostgreSQL
- JWT Authentication

### 🆕 AI Service

- **Python 3.8+**
- **FastAPI** - High-performance async web framework
- **CLIP (ViT-B/32)** - OpenAI's vision model via sentence-transformers
- **Pinecone** - Vector database for similarity search
- **Pillow** - Image processing
- **Uvicorn** - ASGI server

## 📚 Documentation

- **[Getting Started Guide](GETTING_STARTED.md)** - Step-by-step setup checklist
- **[Quick Reference](QUICK_REFERENCE.md)** - Common commands and API endpoints
- **[AI Scanning Setup](AI_SCANNING_SETUP.md)** - Detailed AI service setup
- **[Architecture](ARCHITECTURE.md)** - System design and data flow
- **[Implementation Summary](AI_IMPLEMENTATION_SUMMARY.md)** - What was built

## 🚀 Quick Commands

```powershell
# Setup AI service
cd server/python-ai-service
.\setup.ps1

# Start all services at once
.\start-all.ps1

# Index 10 products for testing
cd server/python-ai-service
.\index-products.ps1 -MaxProducts 10

# Test AI service
curl http://localhost:8001/health
```

## 🎯 How AI Scanning Works

1. **User takes/selects photo** → Camera or gallery
2. **Image sent to AI service** → FastAPI endpoint
3. **CLIP generates embedding** → 512-dimensional vector
4. **Pinecone similarity search** → Find matching products
5. **Results returned** → Products with similarity scores
6. **Navigate to results** → Display matching items

## 🔑 Environment Setup

### Python AI Service (.env)

```env
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=hippiekit-products
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2/products/
PORT=8001
```

### Client (.env)

```env
VITE_AI_SERVICE_URL=http://localhost:8001
```

## 📊 Performance

- **First scan**: ~2-3 seconds (model loading)
- **Subsequent scans**: ~200-400ms
- **Indexing**: ~2-5 seconds per product
- **Model size**: ~350MB (one-time download)

## 🆘 Troubleshooting

See `QUICK_REFERENCE.md` for common issues and solutions.

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contribution Guidelines Here]
