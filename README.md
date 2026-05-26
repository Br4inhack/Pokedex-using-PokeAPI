# 🔴 PokéDex Explorer — Production-Grade Node.js Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Joi](https://img.shields.io/badge/Joi-Validation-0080FF?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

**A full-stack PokéDex application with a production-grade Node.js/Express REST API backend and a modern dark-themed frontend UI. Built with real-world engineering practices: JWT authentication, request validation, in-memory caching, MVC architecture, centralized error handling, and a clean service/controller separation.**

[Features](#-features) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Design Decisions](#-design-decisions) • [Roadmap](#-roadmap)

</div>

---

## 📸 Preview

> Search any Pokémon by name or ID and get a rich, interactive card with stats, abilities, flavor text, shiny sprites, breeding info, and held items — all served through a custom caching API.

---

## ✨ Features

### Backend API
- 🔐 **JWT Authentication** — stateless Bearer token auth with `jsonwebtoken` & `bcryptjs`
- ✅ **Joi Request Validation** — schema validation on query params, route params, and request body
- ⚡ **In-Memory Caching** — TTL-based cache abstraction (swappable for Redis) reduces PokéAPI calls
- 🧱 **MVC Architecture** — clean separation of Controllers → Services → External API Client
- 🛡️ **Centralized Error Handling** — consistent JSON error responses with `statusCode` propagation
- 🌐 **CORS Configured** — supports browser-based frontends including `file://` origins
- 🔁 **Request Validation Middleware** — reusable factory (`validate.js`) used across all routes
- 📋 **HATEOAS Pagination** — self/next/prev/first/last links so clients never build URLs
- 🏥 **Health Check Endpoint** — `/health` for uptime monitoring
- 💥 **Graceful Crash Handling** — unhandled promise rejection kills the process cleanly
- 🔧 **Centralized Config** — all `process.env` reads in one `config/index.js` with fail-fast validation

### Frontend UI
- 🌑 **Premium Dark Theme** — glassmorphism-inspired dark design with type-tinted gradients
- ✨ **Shiny Sprite Toggle** — switch between normal and shiny official artwork with fade transition
- 📊 **Animated Stat Bars** — color-coded bars per stat with base stat total
- ⚡ **Abilities Panel** — hidden abilities highlighted with a distinct badge
- 📖 **Pokédex Entry Carousel** — paginate through all game flavor text entries
- 🌿 **Training & Breeding Info** — growth rate, egg groups, habitat, forms, base EXP
- 🎒 **Held Items Display** — wild held items as chips with graceful empty state
- 🏆 **Special Badges** — Legendary / Mythical / Baby / Generation labels
- 🎨 **Type-Colored Hero** — hero background gradient dynamically matches primary type
- 📱 **Fully Responsive** — adapts cleanly to mobile screens
- 🔍 **Debounced Search** — 450ms debounce to avoid spamming API on every keystroke
- ❌ **AbortController** — in-flight requests are cancelled when a new search fires

### Developer Experience
- 🧪 **Automated Integration Tests** — `test-api.js` covers full auth + favorites flow (9 steps)
- 🔄 **Nodemon Dev Server** — hot reload on file save
- 📦 **Modular Utilities** — `asyncHandler`, `cache`, `transform/`, `apiError` reused everywhere
- 🗂️ **Path-structured Exports** — each module has a single, clear responsibility

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       Browser / Client                       │
│           index.html  ←→  app.js (Vanilla JS)                │
└─────────────────────────────┬────────────────────────────────┘
                              │ HTTP (fetch)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Express.js REST API                       │
│                                                              │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │  Routes  │ → │  Middleware  │ → │     Controllers      │ │
│  │  /v1/*   │   │  validate    │   │  pokemon.controller  │ │
│  │          │   │  requireAuth │   │  auth.controller     │ │
│  │          │   │  errorHandler│   │  favorites.controller│ │
│  └──────────┘   └──────────────┘   └──────────┬───────────┘ │
│                                               │             │
│                                               ▼             │
│                                    ┌──────────────────────┐ │
│                                    │      Services        │ │
│                                    │  pokemon.service     │ │
│                                    │  pokemon.detail      │ │
│                                    │  auth.service        │ │
│                                    │  favorites.service   │ │
│                                    └──────────┬───────────┘ │
│                                               │             │
│                          ┌────────────────────┼───────────┐ │
│                          ▼                    ▼           │ │
│                  ┌──────────────┐    ┌──────────────────┐ │ │
│                  │  Cache Layer │    │  PokéAPI Client  │ │ │
│                  │  utils/cache │    │  api/pokeapi     │ │ │
│                  └──────────────┘    └────────┬─────────┘ │ │
│                                              │            │ │
└──────────────────────────────────────────────┼────────────┘ │
                                               │              │
                                               ▼              │
                                    ┌──────────────────────┐  │
                                    │   PokéAPI (External) │  │
                                    │  pokeapi.co/api/v2   │  │
                                    └──────────────────────┘  │
```

### Key Architecture Principles

| Principle | Implementation |
|---|---|
| **Separation of Concerns** | Routes → Controllers → Services → API Client. Each layer has one job. |
| **Anti-Corruption Layer** | All PokéAPI calls go through `api/pokeapi.client.js`. Services never call `fetch()` directly. |
| **DRY** | `asyncHandler` HOF eliminates try/catch repetition. `validate()` factory reused across all routes. |
| **Fail Fast** | Config validates `JWT_SECRET` at startup in production — crashes loudly before taking requests. |
| **Swappable Infrastructure** | `utils/cache.js` abstracts the Map. Redis replaces it in Phase 5 without touching any service. |
| **Pure Transforms** | `utils/transform/pokemon.transform.js` contains only pure functions — no side effects, easily testable. |

---

## 📁 Project Structure

```
Pokedex/
│
├── index.html                        # Frontend entry point
├── app.js                            # Frontend logic (Vanilla JS)
├── .gitignore
│
└── pokemon-api/                      # Node.js REST API
    ├── package.json
    ├── test-api.js                   # Integration test suite (9 steps)
    │
    └── src/
        ├── index.js                  # Server bootstrap, graceful crash handler
        ├── app.js                    # Express app, middleware stack, route mounting
        │
        ├── config/
        │   └── index.js              # ✅ All env vars typed, validated, defaulted here
        │
        ├── api/
        │   └── pokeapi.client.js     # ✅ Anti-Corruption Layer — all PokéAPI fetch calls
        │
        ├── controllers/
        │   ├── pokemon.controller.js # Handles HTTP in/out for pokemon routes
        │   ├── auth.controller.js    # register, login, getMe
        │   └── favorites.controller.js
        │
        ├── services/
        │   ├── pokemon.service.js         # List, basic lookup, by-type
        │   ├── pokemon.detail.service.js  # ✅ Rich detail via parallel Promise.all()
        │   ├── auth.service.js            # JWT generation, bcrypt hashing, user store
        │   └── favorites.service.js       # Per-user favorites (Map-based)
        │
        ├── middleware/
        │   ├── auth.js               # Bearer token extractor & verifier (requireAuth)
        │   ├── validate.js           # ✅ Joi validation factory — reusable across all routes
        │   ├── errorHandler.js       # Global error handler (4-arg Express signature)
        │   └── notFound.js           # 404 catch-all
        │
        ├── routes/
        │   ├── pokemon.routes.js     # GET /pokemon, /:name, /:name/detail, /type/:type
        │   ├── auth.routes.js        # POST /auth/register, /login, GET /auth/me
        │   └── favorites.routes.js   # GET|POST|DELETE /favorites (auth-protected)
        │
        ├── validators/
        │   └── pokemon.validators.js # Joi schemas: list, get, type
        │
        └── utils/
            ├── asyncHandler.js       # ✅ HOF — wraps async handlers, auto-forwards errors
            ├── cache.js              # ✅ TTL cache abstraction over Map (Redis-ready interface)
            └── transform/
                └── pokemon.transform.js  # ✅ Pure DTO transform functions (sprites, stats, species)
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Response Envelope
All responses follow a consistent shape:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "details": [ ... ]   // only present on validation errors (Joi)
  }
}
```

---

### 🟢 Pokémon Endpoints

#### `GET /pokemon`
Returns a paginated list of Pokémon with HATEOAS navigation links.

| Query Param | Type | Default | Constraints |
|---|---|---|---|
| `limit` | integer | `20` | 1–100 |
| `offset` | integer | `0` | ≥ 0 |

**Example:**
```bash
curl http://localhost:5000/api/v1/pokemon?limit=10&offset=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pagination": {
      "total": 1302,
      "limit": 10,
      "offset": 20,
      "currentPage": 3,
      "totalPages": 131,
      "hasNext": true,
      "hasPrev": true,
      "links": {
        "self":  "/api/v1/pokemon?limit=10&offset=20",
        "next":  "/api/v1/pokemon?limit=10&offset=30",
        "prev":  "/api/v1/pokemon?limit=10&offset=10",
        "first": "/api/v1/pokemon?limit=10&offset=0",
        "last":  "/api/v1/pokemon?limit=10&offset=1300"
      }
    },
    "results": [
      { "name": "raticate", "id": 20 },
      ...
    ]
  }
}
```

---

#### `GET /pokemon/:name`
Returns basic Pokémon data. `:name` can be a name (e.g. `pikachu`) or numeric ID (e.g. `25`).

**Example:**
```bash
curl http://localhost:5000/api/v1/pokemon/pikachu
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "pikachu",
    "height": 0.4,
    "weight": 6.0,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/...",
    "types": ["electric"],
    "abilities": [
      { "name": "static",      "isHidden": false },
      { "name": "lightning-rod","isHidden": true  }
    ],
    "stats": [
      { "name": "hp",               "value": 35 },
      { "name": "attack",           "value": 55 },
      { "name": "defense",          "value": 40 },
      { "name": "special-attack",   "value": 50 },
      { "name": "special-defense",  "value": 50 },
      { "name": "speed",            "value": 90 }
    ],
    "baseExperience": 112
  }
}
```

---

#### `GET /pokemon/:name/detail` ⭐
Returns **rich detail** — aggregates the Pokémon endpoint and Species endpoint in **parallel** using `Promise.all()`.

**Example:**
```bash
curl http://localhost:5000/api/v1/pokemon/charizard/detail
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "charizard",
    "height": 1.7,
    "weight": 90.5,
    "baseExperience": 267,
    "sprites": {
      "default":    "https://raw.githubusercontent.com/.../6.png",
      "shiny":      "https://raw.githubusercontent.com/.../shiny/6.png",
      "officialArt":"https://raw.githubusercontent.com/.../official-artwork/6.png",
      "shinyArt":   "https://raw.githubusercontent.com/.../official-artwork/shiny/6.png",
      "dreamWorld": "https://raw.githubusercontent.com/.../dream-world/6.svg"
    },
    "types": ["fire", "flying"],
    "abilities": [
      { "name": "blaze",       "isHidden": false, "slot": 1 },
      { "name": "solar-power", "isHidden": true,  "slot": 3 }
    ],
    "stats": [
      { "name": "hp",             "value": 78, "effort": 0 },
      { "name": "attack",         "value": 84, "effort": 0 },
      { "name": "defense",        "value": 78, "effort": 0 },
      { "name": "special-attack", "value": 109,"effort": 3 },
      { "name": "special-defense","value": 85, "effort": 0 },
      { "name": "speed",          "value": 100,"effort": 0 }
    ],
    "statTotal": 534,
    "heldItems": [],
    "forms": ["charizard"],
    "genus": "Flame Pokémon",
    "habitat": "mountain",
    "generation": "generation-i",
    "isLegendary": false,
    "isMythical": false,
    "isBaby": false,
    "captureRate": 45,
    "baseHappiness": 70,
    "growthRate": "medium-slow",
    "eggGroups": ["monster", "dragon"],
    "flavorTexts": [
      "Spits fire that is hot enough to melt boulders.",
      "... (17 unique English entries)"
    ],
    "evolutionChainUrl": "https://pokeapi.co/api/v2/evolution-chain/2/"
  }
}
```

---

#### `GET /pokemon/type/:type`
Returns all Pokémon of a given type.

| Route Param | Valid Values |
|---|---|
| `type` | `normal`, `fire`, `water`, `grass`, `electric`, `ice`, `fighting`, `poison`, `ground`, `flying`, `psychic`, `bug`, `rock`, `ghost`, `dragon`, `dark`, `steel`, `fairy` |

**Example:**
```bash
curl http://localhost:5000/api/v1/pokemon/type/dragon
```

---

### 🔐 Auth Endpoints

#### `POST /auth/register`
Creates a new user account. Password is hashed with **bcrypt** (cost factor 12). Returns JWT.

**Request Body:**
```json
{
  "email":    "user@example.com",
  "password": "securepass123",
  "username": "trainer_red"
}
```

**Validation Rules:**
- `email` — valid email format, required
- `password` — minimum 8 characters, required
- `username` — 2–30 characters, required

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id":        "uuid-v4",
      "email":     "user@example.com",
      "username":  "trainer_red",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### `POST /auth/login`
Authenticates credentials and returns a fresh JWT.

**Request Body:**
```json
{
  "email":    "user@example.com",
  "password": "securepass123"
}
```

> **Security note:** Uses identical error message for "user not found" and "wrong password" to prevent email enumeration. `bcrypt.compare` is used to prevent timing attacks.

---

#### `GET /auth/me`
Returns the authenticated user's profile. Requires `Authorization: Bearer <token>`.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id":       "uuid-v4",
      "email":    "user@example.com",
      "username": "trainer_red"
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": { "message": "Authentication required. Please provide a valid Bearer token." }
}
```

---

### ❤️ Favorites Endpoints

> All favorites routes require `Authorization: Bearer <token>`

#### `GET /favorites`
Returns the authenticated user's complete favorites list.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "favorites": ["pikachu", "mewtwo"],
    "count": 2
  }
}
```

---

#### `POST /favorites/:pokemonName`
Adds a Pokémon to the user's favorites.

**Response (201):**
```json
{
  "success": true,
  "data": { "pokemonName": "pikachu", "message": "Added to favorites" }
}
```

**Error (409)** — already in favorites:
```json
{
  "success": false,
  "error": { "message": "pikachu is already in your favorites" }
}
```

---

#### `DELETE /favorites/:pokemonName`
Removes a Pokémon from favorites.

**Response:** `204 No Content`

---

### 🏥 Health Check

#### `GET /health`
```json
{ "status": "OK", "message": "Pokemon API is running" }
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (v22 recommended)
- **npm** v8+
- Internet access (proxies PokéAPI)

### 1. Clone the repository
```bash
git clone https://github.com/Br4inhack/Pokedex-using-PokeAPI.git
cd Pokedex-using-PokeAPI
```

### 2. Install dependencies
```bash
cd pokemon-api
npm install
```

### 3. Configure environment variables
```bash
# Create the .env file inside pokemon-api/
cp .env.example .env   # or create manually
```

Edit `pokemon-api/.env`:
```env
PORT=5000
NODE_ENV=development

# REQUIRED: Generate a strong secret — never commit this
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Optional — defaults to pokeapi.co
POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# Cache TTL in minutes (default: 10)
CACHE_TTL_MINUTES=10
```

> ⚠️ `.env` is already in `.gitignore`. Never commit secrets.

### 4. Start the development server
```bash
# From pokemon-api/ directory
npm run dev
```

You should see:
```
========================================
⚡️ Server is running on port 5000
🌱 Environment: development
🏥 Health Check: http://localhost:5000/health
========================================
```

### 5. Open the frontend
Open `index.html` directly in your browser (double-click, or drag to browser window).

---

## 🧪 Running Tests

The integration test suite covers the full auth + favorites flow:

```bash
# Ensure the dev server is running first (npm run dev)
cd pokemon-api
node test-api.js
```

**Test coverage (9 steps):**
```
Step 1: User registration                  → 201 Created
Step 2: Login (get JWT token)              → 200 + token
Step 3: GET /auth/me with token            → 200 user profile
Step 4: GET /auth/me without token         → 401 Unauthorized
Step 5: Add pikachu to favorites           → 201 Created
Step 6: Add charizard + mewtwo             → 201 Created
Step 7: List all favorites                 → 200 + array
Step 8: Delete charizard from favorites    → 204 No Content
Step 9: Add duplicate pikachu              → 409 Conflict ✅
```

---

## 🎨 Frontend Features In Detail

The frontend (`index.html` + `app.js`) is written in **pure Vanilla JS** — no frameworks, no bundlers.

### UI Architecture
```
handleSearch()          ← Controller: orchestrates fetch + render
  └─ fetchPokemonDetail()    ← API Layer: calls /pokemon/:name/detail
  └─ renderCard()            ← UI Layer: delegates to section renderers
       ├─ renderHero()       ← sprites, name, types, meta, badges
       ├─ renderStats()      ← bars with stat-max % calc, total
       ├─ renderAbilities()  ← hidden ability detection
       ├─ renderFlavor()     ← paginated flavor text with navigation
       ├─ renderInfo()       ← breeding/training grid
       └─ renderHeldItems()  ← chip list or empty state
```

### Implemented Patterns
| Pattern | Where |
|---|---|
| Debounce | `input` event — 450ms delay before firing search |
| AbortController | Cancels previous request when new search fires |
| State management | `currentPokemon`, `flavorIndex`, `currentSprite` module-scope vars |
| Dynamic CSS vars | Hero gradient via `--type-gradient` CSS custom property set by JS |
| Accordion panels | Toggle `open` class on header/body/chevron |

---

## 🔒 Security Practices

| Concern | Implementation |
|---|---|
| Password storage | `bcryptjs` with cost factor 12 — never plaintext |
| Token verification | `jsonwebtoken.verify()` — throws on tampered/expired tokens |
| Error message parity | Same message for "user not found" and "wrong password" — prevents enumeration |
| Stack trace leaking | Stack only included in error responses in `development` mode |
| Input validation | Joi strips unknown fields (`stripUnknown: true`) and rejects invalid input early |
| Secrets management | `JWT_SECRET` read from env, never hardcoded; fail-fast in production if missing |

---

## 🎯 Design Decisions

### Why `asyncHandler`?
Every controller previously had `try { } catch (err) { next(err) }`. That's boilerplate noise. `asyncHandler` is a higher-order function that wraps any async route handler and auto-forwards errors to `next()`. The result: controllers have zero try/catch.

```js
// Without asyncHandler
router.get('/:name', async (req, res, next) => {
  try {
    const data = await pokemonService.getByName(req.params.name);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// With asyncHandler — same behaviour, zero noise
router.get('/:name', asyncHandler(async (req, res) => {
  const data = await pokemonService.getByName(req.params.name);
  res.json({ success: true, data });
}));
```

### Why a dedicated `api/pokeapi.client.js`?
Services previously called `fetch()` directly and each duplicated the same error normalisation. Centralising all external HTTP calls means:
- Error shape is consistent across all endpoints
- Network/DNS errors produce `503` (not unhandled rejections)
- You can mock one module in tests instead of the global `fetch`

### Why `Promise.all()` in the detail service?
The rich detail response requires data from both `/pokemon/:name` and `/pokemon-species/:name`. These requests are **independent** — running them sequentially adds ~300ms of unnecessary latency. `Promise.all()` runs both in parallel and resolves when both complete.

```js
// Sequential — slow (~600ms)
const rawPokemon  = await pokeapi.fetchPokemon(name);
const rawSpecies  = await pokeapi.fetchPokemonSpecies(name);

// Parallel — fast (~300ms)
const [rawPokemon, rawSpecies] = await Promise.all([
  pokeapi.fetchPokemon(name),
  pokeapi.fetchPokemonSpecies(name),
]);
```

### Why extract `utils/cache.js`?
The raw `Map` was inline inside `pokemon.service.js`. It was untestable and non-replaceable. By extracting it to its own module with a clean interface (`get`, `set`, `delete`, `flush`), swapping to Redis is a one-file change — no service code changes required.

### Route ordering matters
```js
router.get('/type/:type', ...);      // ← MUST be before /:name
router.get('/:name/detail', ...);    // ← MUST be before /:name
router.get('/:name', ...);           // ← wildcard last
```
Express matches routes top-down. If `/:name` came first, `/type/fire` would be captured as `name = "type"` and `detail` would be captured as `name = "detail"`.

---

## 🗺️ Roadmap

| Phase | Feature | Status |
|---|---|---|
| ✅ Phase 1 | Project setup, MVC structure, basic Pokemon routes | Complete |
| ✅ Phase 2 | JWT auth, bcrypt, register/login/me | Complete |
| ✅ Phase 3 | Joi validation, favorites system, standardized responses | Complete |
| ✅ Phase 4a | Config module, cache abstraction, PokéAPI client | Complete |
| ✅ Phase 4b | Rich Pokemon detail (species, sprites, flavor text) | Complete |
| ✅ Phase 4c | Premium UI redesign with all detail fields | Complete |
| 🔜 Phase 5 | Evolution chain endpoint + visual UI chain | Planned |
| 🔜 Phase 6 | Pokémon compare endpoint (`/pokemon/compare?a=X&b=Y`) | Planned |
| 🔜 Phase 7 | Advanced filtering (generation, stat range, habitat) | Planned |
| 🔜 Phase 8 | MongoDB + Team Builder (save/share teams) | Planned |
| 🔜 Phase 9 | Redis cache replacement, rate limiting | Planned |
| 🔜 Phase 10 | Swagger/OpenAPI documentation | Planned |

---

## 📦 Dependencies

### Production
| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | HTTP server & routing |
| `jsonwebtoken` | ^9.0.3 | JWT signing and verification |
| `bcryptjs` | ^3.0.3 | Password hashing (pure JS, no native deps) |
| `joi` | ^18.2.1 | Request schema validation |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing headers |
| `dotenv` | ^16.4.5 | Environment variable loading |

### Development
| Package | Version | Purpose |
|---|---|---|
| `nodemon` | ^3.1.14 | Auto-restart server on file changes |

---

## 📄 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the server listens on |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `JWT_SECRET` | **Yes** | Dev fallback only | Secret key for signing JWTs — use a strong random string in production |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry (e.g. `1d`, `7d`, `24h`) |
| `POKEAPI_BASE_URL` | No | `https://pokeapi.co/api/v2` | Override the upstream PokéAPI base URL |
| `CACHE_TTL_MINUTES` | No | `10` | How long to cache API responses |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/evolution-chains`
3. Commit your changes: `git commit -m 'feat: add evolution chain endpoint'`
4. Push: `git push origin feature/evolution-chains`
5. Open a Pull Request

---

## 📜 License

ISC License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built as a learning project focused on **production-grade Node.js backend engineering** — clean architecture, real-world patterns, and placement interview preparation.

**PokéAPI data is provided by [pokeapi.co](https://pokeapi.co) — a free and open RESTful Pokémon API.**

</div>