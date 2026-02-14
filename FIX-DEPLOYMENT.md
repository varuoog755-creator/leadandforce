# 🛠️ Fix Vercel Build - Manual Copy-Paste Guide

Aapne jo auth diya tha (`ghp_...`), usme **403 Forbidden** error aa raha hai (maybe permissions issue). 

Build fail ho raha hai, isliye hum GitHub web par **"Edit"** button use karke ye 3 files update karenge. Ye sabse fast tarika hai!

---

## 1️⃣ Update `frontend/tsconfig.json`

1. **GitHub par jao:** `frontend/tsconfig.json` kholo
2. **Edit (Pencil icon)** click karo
3. **Pura content replace kar do isse:**

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "lib": [
            "dom",
            "dom.iterable",
            "ESNext"
        ],
        "module": "ESNext",
        "moduleResolution": "node",
        "jsx": "preserve",
        "incremental": true,
        "plugins": [
            {
                "name": "next"
            }
        ],
        "skipLibCheck": true,
        "strict": true,
        "esModuleInterop": true,
        "resolveJsonModule": true,
        "isolatedModules": true
    }
}
```

4. **"Commit changes"** click karo.

---

## 2️⃣ Update `frontend/app/dashboard/page.tsx`

1. **GitHub par jao:** `frontend/app/dashboard/page.tsx` kholo
2. **Edit (Pencil icon)** click karo
3. **Line 22 aur handleLogout fix karo (ya pura content paste karo):**

**Fixed useEffect (Lines 22-30):**
```tsx
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = window.localStorage.getItem('token');
            if (!token) {
                router.push('/');
                return;
            }
            fetchAnalytics(token);
        }
    }, [router]);
```

**Fixed handleLogout (Lines 45-49):**
```tsx
    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');
        }
        router.push('/');
    };
```

4. **"Commit changes"** click karo.

---

## 3️⃣ Update `frontend/app/page.tsx`

1. **GitHub par jao:** `frontend/app/page.tsx` kholo
2. **Edit (Pencil icon)** click karo
3. **handleSubmit mein localStorage fix karo:**

**Fixed localStorage part (around Line 29):**
```tsx
            // Store token and user data
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('token', response.data.token);
                window.localStorage.setItem('user', JSON.stringify(response.data.user));
            }
```

4. **"Commit changes"** click karo.

---

## ✅ Final Check

Ye 3 files update hone ke baad:
1. **Vercel** dashboard par jao
2. Naya build automatically start ho jayega
3. Is baar compile ho jayega! 🎉

**Note:** GitHub Desktop par `sync` ya `pull` kar dena baad mein taaki local files bhi match karein.

Kya main aur kisi file ka content doon?
