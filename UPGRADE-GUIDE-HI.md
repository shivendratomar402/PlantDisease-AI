# PlantGuard AI — Premium version (No Login)

Is version mein premium green biotechnology frontend, potato disease library, image prediction UI, theme toggle aur local scan history included hain. Login, signup, logout aur Supabase authentication hata diye gaye hain.

## 1. Frontend local run

1. Node.js 18.17+ install karein.
2. Terminal mein `frontend_website` folder kholein.
3. `.env.example` ko copy karke `.env.local` banayein.
4. `NEXT_PUBLIC_API_URL` ko apne active FastAPI `/predict` endpoint se set karein.
5. `npm install` chalayein.
6. `npm run dev` chalayein aur `http://localhost:3000` kholein.

## 2. Scan history

Prediction summaries browser ke local storage mein isi device/browser par save hoti hain. History cross-device sync nahi hoti. Browser data clear karne par history delete ho sakti hai.

## 3. Prediction API

Frontend configured `NEXT_PUBLIC_API_URL` par request bhejta hai. Agar hosted Render endpoint inactive ho, to FastAPI backend ko apne host par deploy karke yahan uska `/predict` URL set karein. Backend ko root project folder se requirements install karke `uvicorn backend_server.api_main:app --host 0.0.0.0 --port 8000` se run kiya ja sakta hai. Hosting provider ke mutabik start command/port adjust karein.

## 4. Vercel deployment

1. Updated project apni GitHub repository mein upload/push karein.
2. Vercel → Add New → Project → apni repository import karein.
3. Root Directory `frontend_website` select karein.
4. Environment Variables mein `NEXT_PUBLIC_API_URL` add karein.
5. Deploy karein.

## 5. Important limitations

- Login/signup/logout intentionally included nahi hain.
- Scan history local browser/device tak limited hai.
- Prediction backend active hona zaroori hai; unavailable/sleeping service par scan fail ho sakta hai.
- Model potato Early Blight, Late Blight aur Healthy classes ke liye hai; other crops/diseases identify karne ka claim nahi karta.
- Confidence model output score hai, guaranteed diagnosis ya calibrated probability nahi.
- Disease guidance general integrated pest management information hai. Pesticide selection/rates local registration and product label ke mutabik agricultural expert se confirm karein.
