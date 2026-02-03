# Sửa lỗi Font chữ Frontend (UTF-8)

## 🔴 Vấn đề:
Font chữ bị lỗi ở tất cả các trang frontend, hiển thị như: "m?ng" thay vì "mừng", "t?" thay vì "tức"

## ✅ Đã sửa:

### 1. **index.html** ✅
- Thêm Google Fonts (Roboto) hỗ trợ tiếng Việt
- Thêm meta charset UTF-8
- Đổi `lang="en"` → `lang="vi"`

**Thay đổi:**
```html
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!-- Google Fonts - Roboto hỗ trợ tiếng Việt -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  </head>
</html>
```

### 2. **index.css** ✅
- Thêm font-family hỗ trợ tiếng Việt cho `:root` và `html, body`

**Thay đổi:**
```css
:root {
  font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}

html, body {
  font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}
```

### 3. **AdminPage.css** ✅
- Thêm font-family vào `.admin-page`

**Thay đổi:**
```css
.admin-page {
  font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}
```

### 4. **Login.css** ✅
- Sửa font-family trong `.login-page` và `*` selector

**Thay đổi:**
```css
* {
  font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}

.login-page {
  font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}
```

### 5. **main.jsx** ✅
- Đảm bảo import `index.css`

**Thay đổi:**
```javascript
import './index.css'; // Đảm bảo import index.css với font settings
```

---

## 🎯 Font Stack được sử dụng:

```css
font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
```

**Giải thích:**
1. **Roboto** - Google Font hỗ trợ tiếng Việt tốt (đã import từ Google Fonts)
2. **Segoe UI** - Font Windows, hỗ trợ tiếng Việt
3. **Helvetica Neue** - Font macOS/iOS, hỗ trợ tiếng Việt
4. **Arial** - Font phổ biến, hỗ trợ tiếng Việt
5. **Noto Sans** - Google Font hỗ trợ Unicode tốt
6. **sans-serif** - Fallback

---

## 🔧 Các bước test:

### Bước 1: Clear Browser Cache
```
Ctrl + Shift + Delete (Windows/Linux)
Cmd + Shift + Delete (Mac)
```

Hoặc Hard Refresh:
```
Ctrl + F5 (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Bước 2: Restart Dev Server
```bash
# Stop dev server (Ctrl + C)
# Start lại
npm run dev
```

### Bước 3: Kiểm tra Network Tab
Mở DevTools → Network tab → Xem request Google Fonts:
```
https://fonts.googleapis.com/css2?family=Roboto...
```

### Bước 4: Kiểm tra Font đã load
Mở DevTools → Elements tab → Inspect text → Xem Computed styles:
```
font-family: "Roboto", sans-serif
```

---

## 🐛 Troubleshooting:

### Issue 1: Font vẫn không hiển thị đúng
**Nguyên nhân:** Browser cache hoặc Google Fonts chưa load

**Giải pháp:**
1. Hard refresh (Ctrl+F5)
2. Kiểm tra Network tab xem Google Fonts có load không
3. Kiểm tra Console có lỗi không
4. Thử dùng Incognito/Private mode

### Issue 2: Google Fonts không load
**Nguyên nhân:** Internet connection hoặc CORS

**Giải pháp:**
1. Kiểm tra internet connection
2. Thử dùng font local thay vì Google Fonts:
   ```css
   font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
   ```

### Issue 3: Một số trang vẫn lỗi font
**Nguyên nhân:** CSS override hoặc component không inherit font

**Giải pháp:**
1. Kiểm tra DevTools → Elements → Computed styles
2. Tìm CSS nào override font-family
3. Thêm `!important` nếu cần (không khuyến nghị)

### Issue 4: Data từ API vẫn bị lỗi
**Nguyên nhân:** Backend không trả về UTF-8 đúng

**Giải pháp:**
1. Kiểm tra response headers có `charset=UTF-8` không
2. Kiểm tra backend encoding config (đã sửa trong `application.properties` và `WebConfig.java`)
3. Kiểm tra database có dùng `NVARCHAR` không

---

## ✅ Checklist:

- [ ] Đã thêm Google Fonts (Roboto) vào `index.html`
- [ ] Đã sửa `lang="vi"` trong `index.html`
- [ ] Đã thêm font-family vào `index.css`
- [ ] Đã thêm font-family vào `AdminPage.css`
- [ ] Đã sửa font-family trong `Login.css`
- [ ] Đã import `index.css` trong `main.jsx`
- [ ] Đã clear browser cache
- [ ] Đã restart dev server
- [ ] Đã test tất cả các trang
- [ ] Font chữ hiển thị đúng tiếng Việt

---

## 📝 Lưu ý:

1. **Google Fonts:**
   - Cần internet connection để load
   - Có thể cache trong browser
   - Nếu không có internet, dùng system fonts

2. **System Fonts:**
   - Windows: Segoe UI
   - macOS/iOS: Helvetica Neue, San Francisco
   - Android: Roboto (thường có sẵn)
   - Linux: DejaVu Sans, Liberation Sans

3. **Fallback:**
   - Luôn có `sans-serif` làm fallback
   - Đảm bảo font stack có ít nhất 1 font hỗ trợ tiếng Việt

4. **Performance:**
   - Google Fonts có thể làm chậm page load
   - Có thể preload font nếu cần:
     ```html
     <link rel="preload" href="https://fonts.googleapis.com/css2?family=Roboto..." as="style">
     ```

---

## 🎯 Sau khi sửa:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Restart dev server** (nếu cần)
4. **Test lại** - Font chữ phải hiển thị đúng tiếng Việt

---

## ✅ Summary:

**Đã sửa:**
- ✅ Thêm Google Fonts (Roboto) vào `index.html`
- ✅ Sửa font-family trong `index.css`
- ✅ Sửa font-family trong `AdminPage.css`
- ✅ Sửa font-family trong `Login.css`
- ✅ Đảm bảo import `index.css` trong `main.jsx`

**Font stack:**
- Roboto (Google Fonts)
- Segoe UI (Windows)
- Helvetica Neue (macOS/iOS)
- Arial (Fallback)
- Noto Sans (Unicode support)
- sans-serif (Final fallback)

**Nếu vẫn lỗi:**
- Kiểm tra backend encoding (đã sửa trong `application.properties` và `WebConfig.java`)
- Kiểm tra database có dùng `NVARCHAR` không
- Kiểm tra data trong database có đúng encoding không

---

**Chúc bạn thành công!** 🎉
