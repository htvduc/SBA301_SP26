# Vite Environment Variables

## 🔧 Sửa lỗi "process is not defined"

### Vấn đề:
Vite sử dụng `import.meta.env` thay vì `process.env` (như Create React App).

### ✅ Đã sửa:
- Đổi `process.env.REACT_APP_API_URL` → `import.meta.env.VITE_API_URL`
- File: `src/services/api.js`

---

## 📝 Environment Variables trong Vite

### 1. **Prefix `VITE_`**
- Tất cả biến môi trường phải có prefix `VITE_`
- Không phải `REACT_APP_` như Create React App

### 2. **Cách sử dụng:**
```javascript
// ❌ SAI (Create React App):
const API_URL = process.env.REACT_APP_API_URL;

// ✅ ĐÚNG (Vite):
const API_URL = import.meta.env.VITE_API_URL;
```

### 3. **File `.env`:**
Tạo file `.env` trong thư mục root của project:

```env
VITE_API_URL=http://localhost:8080/api
```

### 4. **Các file `.env` khác:**
- `.env` - Tất cả môi trường (local development)
- `.env.local` - Local overrides (gitignore)
- `.env.development` - Development mode
- `.env.production` - Production mode
- `.env.example` - Template (commit vào git)

---

## 🚀 Sử dụng

### Option 1: Dùng default (không cần .env)
- Code đã có default: `'http://localhost:8080/api'`
- Không cần tạo file `.env` nếu dùng default

### Option 2: Tạo file `.env`
1. Copy `.env.example` → `.env`
2. Sửa giá trị nếu cần:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
3. Restart dev server

---

## ⚠️ Lưu ý

1. **Restart required:** Phải restart dev server sau khi thay đổi `.env`
2. **Git ignore:** File `.env` nên được thêm vào `.gitignore`
3. **Type safety:** TypeScript có thể cần type definitions:
   ```typescript
   interface ImportMetaEnv {
     readonly VITE_API_URL: string
   }
   ```

---

## ✅ Đã sửa xong!

Lỗi "process is not defined" đã được fix. Refresh browser và test lại!
