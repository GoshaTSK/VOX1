# 🚀 Инструкция по загрузке на GitHub

## Шаг 1: Создай репозиторий на GitHub

1. Перейди на [github.com/new](https://github.com/new)
2. Заполни:
   - **Repository name**: `voxel-academy` (или любое другое)
   - **Description**: `Образовательная платформа Voxel Academy`
   - Выбери **Public**
   - ✅ **НЕ ставь** галочку "Add a README" (мы уже создали свой)
3. Нажми **Create repository**

---

## Шаг 2: Загрузи файлы

### Вариант A: Через веб-интерфейс (проще)

1. На странице репозитория нажми **"uploading an existing file"**
2. Скачай папку проекта с этой платформы
3. Перетащи **все файлы** в окно загрузки
4. Нажми **Commit changes**

### Вариант B: Через Git (правильнее)

Открой терминал в папке проекта и выполни:

```bash
# Инициализация Git
git init
git add .
git commit -m "Initial commit: Voxel Academy auth system"

# Подключение к GitHub (замени USERNAME на свой логин)
git branch -M main
git remote add origin https://github.com/USERNAME/voxel-academy.git
git push -u origin main
```

---

## Шаг 3: Включи GitHub Pages (чтобы сайт работал по ссылке)

1. Перейди в **Settings** твоего репозитория
2. В левом меню выбери **Pages**
3. В разделе **Source** выбери:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Нажми **Save**
5. Подожди 1-2 минуты
6. Твой сайт будет доступен по адресу:
   ```
   https://USERNAME.github.io/voxel-academy/
   ```

---

## ⚠️ Важно!

### Для GitHub Pages нужно:

1. **Собрать проект** перед загрузкой:
   ```bash
   npm run build
   ```

2. **Изменить `vite.config.js`** — добавить `base`:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/voxel-academy/', // ← имя твоего репозитория
   })
   ```

3. **Пересобрать** после изменения конфига:
   ```bash
   npm run build
   ```

4. **Загрузить папку `dist/`** на GitHub (именно её, а не весь проект)

---

## 🎯 Альтернатива: Netlify Drop (ещё проще!)

Если не хочешь возиться с GitHub Pages:

1. Перейди на [app.netlify.com/drop](https://app.netlify.com/drop)
2. Перетащи папку **`dist/`** в окно
3. Получи ссылку за 10 секунд! 🎉

---

## ✅ Готово!

Теперь твой проект:
- 📦 Хранится на GitHub
- 🌐 Доступен по ссылке через GitHub Pages
- 🔄 Автоматически обновляется при каждом коммите

---

## 🆘 Если что-то не работает:

1. Проверь, что загрузил **все файлы** (включая `package.json`, `vite.config.js`)
2. Убедись, что в Settings → Pages выбран правильный branch
3. Подожди 2-3 минуты после первого коммита
4. Проверь консоль браузера (F12) на ошибки

---

Удачи! 🚀
