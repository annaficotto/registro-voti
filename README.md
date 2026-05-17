# 📚 Registro Voti

A Progressive Web App (PWA) for managing school grades, built with **Vue 3**, **Vite**, and **Node.js/Express**.

Track your grades, calculate averages, set goals, and project your final report card — all in a clean, modern interface.

---

## Features

- **Grade management** — add, edit, and delete grades with type (written/oral/practical), date, period, and notes
- **Per-subject averages** — split by type and by quarter (Q1/Q2)
- **Goal calculator** — see the minimum grade needed to reach your target average in each subject
- **Projection view** — simulate your final report card, including behaviour grade and school credits (3rd–5th year)
- **Statistics** — grade distribution, per-subject averages, global average trend
- **Per-subject target average** — set a different goal for each subject
- **Automatic period detection** — Q1 (Sep–Dec), Q2 (Jan–Jun), overridable
- **Offline-ready PWA** — installable on mobile and desktop
- **JSON persistence** — all data saved locally in a single JSON file

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vite, Composition API |
| UI | Bulma CSS, Font Awesome 6 |
| State | Pinia |
| Backend | Node.js, Express 5 |
| Storage | JSON file (no database) |
| PWA | vite-plugin-pwa, Workbox |

---

## Project Structure

```
registro-voti/
├── src/
│   ├── views/
│   │   ├── DashboardView.vue
│   │   ├── SubjectView.vue
│   │   ├── StatsView.vue
│   │   ├── GoalView.vue
│   │   ├── ProjectionView.vue
│   │   └── SettingsView.vue
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppNavbar.vue
│   │   ├── grades/
│   │   │   └── AddGradeModal.vue
│   │   └── subjects/
│   │       └── SubjectCard.vue
│   ├── stores/
│   │   ├── auth.js
│   │   └── grades.js
│   ├── composables/
│   │   └── useGradeCalc.js
│   ├── router/
│   │   └── index.js
│   ├── style.css
│   └── main.js
├── server/
│   ├── routes/
│   │   └── api.js
│   ├── data/
│   │   └── data.json        ← all user data lives here
│   └── index.js
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/registro-voti.git
cd registro-voti

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running locally

You need two terminals open simultaneously.

**Terminal 1 — Backend:**
```bash
cd server
node index.js
# Server running on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# App running on http://localhost:5173
```

Then open your browser at **http://localhost:5173**.

---

## Data Storage

All data is stored in `server/data/data.json`. The file is created automatically on first run with this structure:

```json
{
  "settings": {
    "targetAverage": 8.0,
    "schoolYear": "2025-2026",
    "class": "4IC",
    "year": 4
  },
  "subjects": [
    {
      "id": "sub_...",
      "name": "Matematica",
      "color": "#3273dc",
      "targetAverage": 7.5,
      "weight": 1
    }
  ],
  "grades": [
    {
      "id": "g_...",
      "subjectId": "sub_...",
      "value": 7.5,
      "type": "scritto",
      "date": "2025-10-15",
      "period": "Q1",
      "note": "Verifica capitolo 5",
      "createdAt": "2025-10-15T10:30:00Z"
    }
  ]
}
```

To back up your data, simply copy `data.json`.

---

## Grade Calculation Logic

### Subject average
```
average = sum(grades) / count(grades)
```

### Global average
```
globalAverage = average of all subject averages
```

### Minimum grade needed to reach target
```
needed = target × (n + 1) − sum(currentGrades)
```

### School credits (3rd–5th year only)

| Average | 3rd year | 4th year | 5th year |
|---|---|---|---|
| M < 6 | — | — | 7–8 |
| M = 6 | 7–8 | 8–9 | 9–10 |
| 6 < M ≤ 7 | 8–9 | 9–10 | 10–11 |
| 7 < M ≤ 8 | 9–10 | 10–11 | 11–12 |
| 8 < M ≤ 9 | 10–11 | 11–12 | 13–14 |
| 9 < M ≤ 10 | 11–12 | 12–13 | 14–15 |

---

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/data` | Get all data (subjects, grades, settings) |
| PUT | `/settings` | Update settings |
| POST | `/subjects` | Add a subject |
| PUT | `/subjects/:id` | Update a subject |
| DELETE | `/subjects/:id` | Delete a subject and its grades |
| POST | `/grades` | Add a grade |
| PUT | `/grades/:id` | Update a grade |
| DELETE | `/grades/:id` | Delete a grade |

---

## PWA

The app is installable as a PWA on both mobile and desktop. After running `npm run build`, the service worker caches all static assets for offline access.

```bash
npm run build    # Build for production
npm run preview  # Preview the production build
```

---

## License

MIT