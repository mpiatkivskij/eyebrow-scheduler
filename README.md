# Eyebrow Scheduler

Веб-додаток для онлайн-запису на процедури перманентного макіяжу. Складається з React фронтенду та Rails API бекенду.

## Стек технологій

| Компонент | Технологія |
|-----------|------------|
| Frontend | React 19, Vite, Tailwind CSS, HeroUI, TanStack Query |
| Backend | Ruby on Rails 8 (API-only), Puma, Solid Queue |
| Database | PostgreSQL |
| Auth | JWT (bcrypt) |
| i18n | EN / UK |

## Структура проекту

```
eyebrow-scheduler/
├── backend/          # Rails API (Ruby 3.2.2, Rails 8.0.1)
└── frontend/         # React SPA (Vite 7)
```

---

## Локальний запуск

### Backend

```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3333
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Фронтенд за замовчуванням використовує API на `http://localhost:3333/api/v1`.

Для зміни — створи файл `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3333/api/v1
```

---

## Деплой на Render

### Архітектура

На Render створюються **3 сервіси**:

| Сервіс | Тип на Render | Опис |
|--------|---------------|------|
| PostgreSQL | Database | Managed PostgreSQL |
| Backend | Web Service (Docker) | Rails API |
| Frontend | Static Site | React SPA |

---

### 1. Створити PostgreSQL базу даних

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **PostgreSQL**
2. Налаштування:
   - **Name**: `eyebrow-scheduler-db`
   - **Region**: найближчий (напр. `Frankfurt (EU Central)`)
   - **Plan**: `Free` або `Starter` ($7/міс)
3. Після створення скопіюй **Internal Database URL**:
   ```
   postgres://user:password@host/dbname
   ```

---

### 2. Задеплоїти Backend (Rails API)

1. **New** → **Web Service**
2. Підключи GitHub репозиторій
3. Налаштування:
   - **Name**: `eyebrow-scheduler-api`
   - **Region**: той самий що й БД
   - **Runtime**: `Docker`
   - **Root Directory**: `backend`
   - **Instance Type**: `Free` або `Starter`

4. **Environment Variables**:

   | Змінна | Значення | Опис |
   |--------|----------|------|
   | `DATABASE_URL` | *Internal Database URL* | URL бази даних з кроку 1 |
   | `RAILS_MASTER_KEY` | *вміст `backend/config/master.key`* | 32-символьний ключ |
   | `RAILS_ENV` | `production` | |
   | `SOLID_QUEUE_IN_PUMA` | `true` | Запуск фонових задач в Puma |
   | `TELEGRAM_TOKEN` | *токен бота* | Для Telegram-сповіщень |
   | `TELEGRAM_CHAT_ID` | *chat id* | Для Telegram-сповіщень |
   | `WEB_CONCURRENCY` | `2` | Кількість Puma workers |
   | `RAILS_MAX_THREADS` | `5` | Потоки та пул БД |

5. Натисни **Create Web Service**

Docker entrypoint автоматично виконає `rails db:prepare` (створення та міграції БД).

Після деплою отримаєш URL:
```
https://eyebrow-scheduler-api.onrender.com
```

---

### 3. Задеплоїти Frontend (Static Site)

1. **New** → **Static Site**
2. Підключи той самий репозиторій
3. Налаштування:
   - **Name**: `eyebrow-scheduler`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:

   | Змінна | Значення |
   |--------|----------|
   | `VITE_API_BASE_URL` | `https://<BACKEND_URL>/api/v1` |

   Заміни `<BACKEND_URL>` на реальний URL бекенду з кроку 2.

5. **Redirects/Rewrites** (обов'язково для SPA):
   - Перейди в Settings → **Redirects/Rewrites**
   - Додай правило:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`

6. Натисни **Create Static Site**

---

### 4. Перевірка

1. Відкрий URL фронтенду — головна сторінка
2. `/admin/login` — вхід в адмін-панель
3. `https://<BACKEND_URL>/api/v1/services` — перевірка API

---

## Можливі проблеми

| Проблема | Рішення |
|----------|---------|
| SSL redirect loop | В `backend/config/environments/production.rb` встанови `config.force_ssl = false` — Render обробляє SSL на рівні проксі |
| `db:prepare` падає | Перевір що `DATABASE_URL` — це **Internal** URL бази |
| Free tier засинає | Безкоштовний план вимикає сервіс через 15 хв неактивності (cold start ~30 сек). Для production — план Starter |
| Фронтенд 404 на refresh | Додай Rewrite правило `/* → /index.html` (крок 3.5) |
| CORS помилки | В `backend/config/initializers/cors.rb` перевір дозволені origins |

---

## Змінні оточення (зведена таблиця)

### Backend

| Змінна | Обов'язкова | За замовчуванням |
|--------|-------------|------------------|
| `DATABASE_URL` | Так (production) | — |
| `RAILS_MASTER_KEY` | Так (production) | — |
| `RAILS_ENV` | Так | `development` |
| `PORT` | Ні | `3000` |
| `SOLID_QUEUE_IN_PUMA` | Ні | — |
| `TELEGRAM_TOKEN` | Ні | є дефолтний |
| `TELEGRAM_CHAT_ID` | Ні | є дефолтний |
| `WEB_CONCURRENCY` | Ні | `1` |
| `RAILS_MAX_THREADS` | Ні | `5` |

### Frontend

| Змінна | Обов'язкова | За замовчуванням |
|--------|-------------|------------------|
| `VITE_API_BASE_URL` | Ні | `http://localhost:3333/api/v1` |