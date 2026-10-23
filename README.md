# NoteHub

Навчальний вебзастосунок для створення, пошуку, перегляду та видалення нотаток.

## Можливості

- Головна сторінка з описом застосунку.
- Список нотаток із пагінацією (12 нотаток на сторінку).
- Пошук нотаток за ключовим словом із затримкою (debounce) 500 мс.
- Створення нотатки у модальному вікні з валідацією форми.
- Видалення нотатки.
- Окрема сторінка з деталями нотатки.
- Стани завантаження та помилок для всіх маршрутів.

## Технології

| Інструмент                    | Призначення                              |
| ----------------------------- | ---------------------------------------- |
| Next.js 15 (App Router)       | маршрутизація, SSR                       |
| React 19, TypeScript          | інтерфейс і типізація                    |
| TanStack Query                | запити на клієнті, prefetch і гідратація |
| Axios                         | HTTP-запити до NoteHub API               |
| Formik + Yup                  | форма створення нотатки та її валідація  |
| react-paginate                | пагінація                                |
| use-debounce                  | відкладений пошук                        |
| CSS Modules, modern-normalize | стилізація                               |
| Prettier, ESLint              | форматування та лінтинг коду             |

## Маршрути

| Маршрут               | Опис                                                                |
| --------------------- | ------------------------------------------------------------------- |
| `/`                   | головна сторінка із загальною інформацією                           |
| `/notes`              | перенаправлення на `/notes/filter/all`                              |
| `/notes/filter/all`   | усі нотатки (тег в API не передається)                              |
| `/notes/filter/{tag}` | нотатки за тегом: `Todo`, `Work`, `Personal`, `Meeting`, `Shopping` |
| `/notes/[id]`         | повна сторінка нотатки (при прямому переході чи оновленні)          |
| `/notes/[id]` (з UI)  | перехоплений маршрут: нотатка відкривається в модальному вікні      |
| будь-який інший шлях  | сторінка `404 - Page not found`                                     |

## Advanced Routing

- **Not found.** `app/not-found.tsx` показує сторінку 404 для неіснуючих маршрутів (також для невідомих тегів).
- **Catch-all.** `app/notes/filter/[...slug]` обробляє `/notes/filter/all` та `/notes/filter/{tag}`. Для `all` параметр `tag` до API не передається.
- **Паралельний маршрут.** `app/notes/filter/@sidebar` містить `SidebarNotes` — меню тегів. Layout `app/notes/filter/layout.tsx` отримує слот `sidebar`, тому при зміні тега змінюється лише область нотаток, а меню лишається на місці.
- **Перехоплення маршруту.** `app/@modal/(.)notes/[id]` перехоплює перехід на `/notes/[id]` і показує `NotePreview` у `Modal` поверх поточного списку. Закриття (×, Esc, клік по фону) виконує `router.back()` і повертає на попередній URL, наприклад `/notes/filter/Work`.

## SSR і CSR

Сторінки `/notes/filter/[...slug]`, `/notes/[id]` та перехоплений маршрут поєднують обидва підходи:

1. **Сервер.** Серверний компонент (`page.tsx`) створює `QueryClient`, завантажує дані через `fetchQuery` / `prefetchQuery` і передає кеш клієнту через `HydrationBoundary`.
2. **Клієнт.** Клієнтські компоненти (`Notes.client.tsx`, `NoteDetails.client.tsx`, `NotePreview.client.tsx`) отримують готові дані з кешу через `useQuery`. `Notes.client.tsx` також керує пошуком, пагінацією та мутаціями (створення й видалення).

Ключі запитів на сервері й клієнті мають збігатися: `["notes", page, search, tag]` для списку та `["note", id]` для деталей.

## Структура проєкту

```
├── app/
│   ├── layout.tsx                  # глобальний layout: Header, Footer, TanStackProvider, слот modal
│   ├── not-found.tsx               # сторінка 404
│   ├── @modal/                     # паралельний слот для модальних вікон
│   │   ├── default.tsx
│   │   └── (.)notes/[id]/          # перехоплений маршрут: NotePreview у Modal
│   ├── page.tsx                    # головна сторінка (/)
│   └── notes/
│       ├── page.tsx                # redirect на /notes/filter/all
│       ├── Notes.client.tsx        # CSR: useQuery, пошук, пагінація, створення
│       ├── filter/
│       │   ├── layout.tsx          # sidebar + область нотаток
│       │   ├── @sidebar/           # SidebarNotes (паралельний маршрут)
│       │   └── [...slug]/page.tsx  # catch-all: all або тег
│       └── [id]/                   # повна сторінка нотатки
├── components/                     # кожен компонент у власній папці (.tsx + .module.css)
├── lib/
│   ├── constants.ts                # перелік тегів
│   └── api/
│       ├── api.ts                  # axios-інстанс
│       └── notes.ts                # fetchNotes, fetchNoteById, createNote, deleteNote
└── types/
    └── note.ts                     # Note, NewNote, NoteTag, FetchNotesParams, FetchNotesResponse
```

## Запуск локально

1. Встановіть Node.js (версія LTS).
2. Встановіть залежності:

   ```bash
   npm install
   ```

3. Створіть файл `.env.local` на основі `.env.example` і вкажіть свій токен NoteHub:

   ```
   NEXT_PUBLIC_NOTEHUB_TOKEN=ваш_токен
   ```

4. Запустіть сервер розробки та відкрийте http://localhost:3000:

   ```bash
   npm run dev
   ```

## Скрипти

| Команда          | Дія                              |
| ---------------- | -------------------------------- |
| `npm run dev`    | сервер розробки                  |
| `npm run build`  | production-збірка                |
| `npm run start`  | запуск production-збірки         |
| `npm run lint`   | перевірка коду через ESLint      |
| `npm run format` | форматування коду через Prettier |

## Змінні оточення

| Змінна                      | Опис                         |
| --------------------------- | ---------------------------- |
| `NEXT_PUBLIC_NOTEHUB_TOKEN` | токен доступу до NoteHub API |

Назва починається з `NEXT_PUBLIC_`, бо так вимагає умова завдання: така змінна доступна і на сервері, і в браузері. Це означає, що токен потрапляє в клієнтський код, тому використовуйте для навчального проєкту лише навчальний токен.

Перевірити обробку помилок можна, додавши зайвий символ до токена: тоді `error.tsx` покаже повідомлення про помилку.

## Деплой на Vercel

1. Запуште репозиторій на GitHub.
2. Імпортуйте його у Vercel.
3. У Project Settings → Environment Variables додайте `NEXT_PUBLIC_NOTEHUB_TOKEN`.
4. Зробіть redeploy, щоб змінна підхопилась.

## Домашнє завдання 07 — Advanced Routing

- `app/not-found.tsx` показує сторінку 404.
- `/notes/filter/all` і `/notes/filter/{tag}` фільтрують нотатки через параметр `tag` API; для `all` параметр не передається.
- `app/notes/filter/@sidebar` реалізує паралельний слот меню тегів.
- `app/@modal/(.)notes/[id]` перехоплює перехід до нотатки та показує її у модальному вікні. Закриття повертає до попереднього URL.
