# 🌿 PlantGuard AI — Plant Disease Detection System

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.21-FF6F00?logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.164-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An end-to-end, production-ready AI screening platform for early detection of potato leaf diseases (*Alternaria solani* & *Phytophthora infestans*), built as a 2nd-year Biotechnology mini-project.

---

## 📸 Key Features

- **🧠 Deep Learning CNN Classifier:** Custom 4-block Convolutional Neural Network trained with data augmentation, Batch Normalization, and Dropout to prevent overfitting.
- **⚡ High Precision Diagnostics:** Classifies leaves into **Early Blight**, **Late Blight**, or **Healthy** with real-time confidence scoring.
- **🚀 Ultra-Fast FastAPI Backend:** REST API with file validation, PIL RGB preprocessing, and automatic CORS middleware.
- **🎨 Glassmorphic Next.js UI:** Built using Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion animations, and Lucide icons.
- **🩺 Clinical Bio-Treatment Recommendations:** Provides biological pathogen details (*Alternaria solani*, *Phytophthora infestans*) and actionable, eco-friendly Integrated Pest Management (IPM) protocols.
- **🌓 Dark / Light Mode:** Instant theme switcher with full persistence.

---

## 📂 Project Architecture

```
PlantDisease-AI/
├── 📂 ai_brain/
│   ├── 📄 train_model.py          # CNN training pipeline with callbacks
│   ├── 📄 saved_model.h5          # Trained Keras model weights (~7.9 MB)
│   └── 📄 class_indices.json      # Class label mappings
├── 📂 backend_server/
│   └── 📄 api_main.py             # FastAPI backend with /predict endpoint
├── 📂 frontend_website/
│   ├── 📂 app/                    # Next.js App Router (layout, page, globals.css)
│   ├── 📂 components/             # UploadDropzone, ResultCard, ThemeToggle
│   ├── 📄 package.json            # Node.js dependencies
│   └── 📄 tailwind.config.ts      # Tailwind glassmorphism styling
├── 📂 college_docs/
│   └── 📄 Biotech_Project_Report.md # Formal report for college evaluation
├── 📂 dataset/                    # Curated dataset (2,152 potato leaf images)
├── 📄 start_all.bat               # 1-Click launcher (starts backend + frontend)
├── 📄 run_backend.bat             # Starts FastAPI server
├── 📄 run_frontend.bat            # Starts Next.js dev server
├── 📄 .gitignore                  # Git exclusions for venv, node_modules, etc.
└── 📄 README.md                   # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd PlantDisease-AI
```

### 2. 1-Click Launch (Windows)
Double-click `start_all.bat` or run:
```powershell
.\start_all.bat
```
This automatically launches both the FastAPI backend (`http://localhost:8000`) and the Next.js frontend (`http://localhost:3000`).

---

### 3. Manual Setup

#### Backend Setup (Python 3.11)
```powershell
# Create & activate virtual environment
python -m venv env
.\env\Scripts\Activate.ps1

# Install requirements
pip install tensorflow opencv-python fastapi "uvicorn[standard]" python-multipart pydantic numpy pillow tqdm scipy

# Start FastAPI server
uvicorn backend_server.api_main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

#### Frontend Setup (Next.js)
```powershell
cd frontend_website
npm install
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 🔬 Biological Background

| Disease | Pathogen | Type | Symptoms & Mechanism |
| :--- | :--- | :--- | :--- |
| **Early Blight** | *Alternaria solani* | Fungal (Ascomycota) | Concentric ring necrotic lesions ("target board"), chlorotic halo, alternariol toxin. |
| **Late Blight** | *Phytophthora infestans* | Oomycete (Water mold) | Water-soaked dark lesions, rapid foliar collapse, historical cause of Irish Potato Famine. |
| **Healthy** | — | — | Turgid, green lamina, normal chlorophyll reflectance, intact cuticle. |

For deep biochemical analysis and evaluation metrics, see [`college_docs/Biotech_Project_Report.md`](college_docs/Biotech_Project_Report.md).

---

## 📜 License
This project is licensed under the MIT License.

---

## ✨ PlantGuard AI Premium Upgrade (No Login)

The upgraded frontend includes a premium green biotechnology interface, potato disease guide with symptoms and integrated-management recommendations, image prediction UI, theme toggle, local scan-history panel, and image validation. Login/signup/logout and Supabase authentication are intentionally not included. The original CNN model and prediction API contract are retained.

### Local frontend setup

1. In `frontend_website`, copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to the active FastAPI `/predict` endpoint.
3. Run `npm install` and `npm run dev` from `frontend_website`.
4. Open `http://localhost:3000`.

### Production deployment

Import this repository into Vercel and set the Root Directory to `frontend_website`. Configure only `NEXT_PUBLIC_API_URL` from `.env.example`, then deploy. Keep the FastAPI `/predict` service deployed separately and update the URL if its endpoint changes.

See [`UPGRADE-GUIDE-HI.md`](UPGRADE-GUIDE-HI.md) for the step-by-step Hindi setup.

### Notes

- Scan history is stored locally in this browser/device and is not cloud-synced.
- The classifier only covers the three potato classes in its training labels. Predictions are screening results, not confirmed diagnoses.
- Disease management text is general IPM guidance. Local agricultural extension advice and product labels take precedence for crop-protection decisions.
