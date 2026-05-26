# 🔴 PokéDex Explorer

> A production-grade REST API + Vanilla JS frontend built as a structured learning project — progressing from HTTP fundamentals to JWT auth, MVC architecture, and deployment-ready backend patterns.

![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?style=flat-square&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Joi](https://img.shields.io/badge/Joi-Validation-0080FF?style=flat-square)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

---

## 🎯 What This Project Demonstrates

This isn't just a Pokémon app — it's a full demonstration of backend engineering concepts learned end-to-end:

| Concept Learned | Where Applied |
|---|---|
| HTTP methods, status codes, headers | Every API endpoint with correct 200/201/204/400/401/404/409/429 codes |
| REST constraints & statelessness | JWT-based auth — no server-side session state |
| MVC / layered architecture | Routes → Controllers → Services → API Client |
| Async/await, Promises, error handling | `asyncHandler` HOF, `Promise.all()` for parallel fetches |
| Request validation & fail-fast | Joi schemas on all routes — bad input never reaches the service |
| JWT authentication & bcrypt | Register/login flow, `requireAuth` middleware, password hashing |
| In-memory caching (TTL) | `utils/cache.js` abstraction — Redis-swappable interface |
| CORS, rate limiting, security | `express-rate-limit`, same-error auth pattern, no stack leaks in prod |
| API design best practices | Consistent response envelope, HATEOAS pagination links |
| Debounce & AbortController | Frontend search — race conditions handled, no redundant requests |

---

## ✨ Features

**Backend**
- JWT auth (register / login / protected routes) with bcrypt password hashing
- Joi request validation on all query params, route params, and request bodies
- TTL in-memory cache — reduces redundant PokéAPI calls, Redis-ready interface
- Rich Pokémon detail via `Promise.all()` — parallel species + Pokémon fetch
- HATEOAS pagination — `self / next / prev / first / last` links in every list response
- Centralized error handler, `asyncHandler` HOF, consistent JSON response envelope
- Rate limiting on all routes, stricter limit on auth routes
- Fail-fast config validation at startup

**Frontend (Vanilla JS, no frameworks)**
- Dark glassmorphism UI with type-tinted hero gradients
- Shiny sprite toggle, animated stat bars, paginated flavor text carousel
- Debounced search (450ms) + AbortController for in-flight request cancellation
- Fully responsive, no build step required

---

## 🏗️ Architecture

```
Browser (index.html + app.js)
        │  fetch()
        ▼
Express REST API (localhost:5000)
  ├── Routes        → URL mapping, validation middleware, auth guard
  ├── Controllers   → Read req, call service, send res
  ├── Services      → Business logic, caching, data transformation
  └── API Client    → All PokéAPI fetch() calls in one place (anti-corruption layer)
        │
        ▼
   PokéAPI (pokeapi.co)
```

**Key patterns used:**
- `asyncHandler` — eliminates try/catch in every controller
- `validate()` factory — one reusable middleware for all Joi schemas
- `utils/cache.js` — cache abstracted behind a `get/set/delete` interface
- `utils/transform/` — pure DTO functions, no side effects, easily testable
- `api/pokeapi.client.js` — single point for upstream HTTP calls

---

## 📁 Project Structure

```
Pokedex/
├── index.html                  # Frontend
├── app.js                      # Frontend logic (Vanilla JS)
└── pokemon-api/
    └── src/
        ├── index.js            # Server bootstrap
        ├── app.js              # Express setup, middleware, route mounting
        ├── config/index.js     # All env vars — typed, validated, defaulted
        ├── api/
        │   └── pokeapi.client.js       # Anti-corruption layer
        ├── controllers/                # HTTP in/out only
        ├── services/                   # Business logic + caching
        │   ├── pokemon.service.js
        │   ├── pokemon.detail.service.js  # Promise.all() parallel fetch
        │   ├── auth.service.js
        │   └── favorites.service.js
        ├── middleware/
        │   ├── auth.js         # Bearer token extractor & verifier
        │   ├── validate.js     # Joi validation factory
        │   └── errorHandler.js # Global 4-arg error handler
        ├── routes/
        ├── validators/
        └── utils/
            ├── asyncHandler.js
            ├── cache.js        # TTL Map abstraction (Redis-ready)
            └── transform/pokemon.transform.js
```

---

## 🔌 API Reference

**Base URL:** `http://localhost:5000/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/pokemon` | ─ | Paginated list (`?limit&offset`) |
| GET | `/pokemon/:name` | ─ | Basic data by name or ID |
| GET | `/pokemon/:name/detail` | ─ | Rich detail — sprites, species, flavor text |
| GET | `/pokemon/type/:type` | ─ | All Pokémon of a type |
| POST | `/auth/register` | ─ | Create account → JWT |
| POST | `/auth/login` | ─ | Login → JWT |
| GET | `/auth/me` | 🔐 | Own profile |
| GET | `/favorites` | 🔐 | List favorites |
| POST | `/favorites/:name` | 🔐 | Add to favorites |
| DELETE | `/favorites/:name` | 🔐 | Remove from favorites |
| GET | `/health` | ─ | Uptime check |

All responses follow a consistent envelope:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "message": "..." } }
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/Br4inhack/Pokedex-using-PokeAPI.git
cd Pokedex-using-PokeAPI/pokemon-api
npm install
```

Create `pokemon-api/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-strong-secret-here
JWT_EXPIRES_IN=7d
CACHE_TTL_MINUTES=10
```

```bash
npm run dev        # starts server with nodemon on :5000
```

Open `index.html` in your browser. Done.

---

## 🧪 Integration Tests

```bash
# With server running:
node test-api.js
```

Covers 9 steps: registration → login → auth/me → protected route without token → add favorites → duplicate detection → list → delete → 409 conflict.

---

## 🔒 Security Practices

- Passwords hashed with **bcrypt** (cost factor 12) — never stored plaintext
- Identical error for wrong email vs wrong password — prevents email enumeration
- JWT verified on every protected request — tampered tokens rejected
- Stack traces excluded from error responses in production
- `JWT_SECRET` fails fast at startup if missing in production

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` ^5 | HTTP server & routing |
| `jsonwebtoken` | JWT signing & verification |
| `bcryptjs` | Password hashing |
| `joi` | Request schema validation |
| `cors` | Cross-origin headers |
| `dotenv` | Environment variable loading |
| `nodemon` (dev) | Hot reload |

---

## 🗺️ Roadmap

- [ ] Evolution chain endpoint + visual UI
- [ ] Pokémon compare endpoint (`/pokemon/compare?a=X&b=Y`)
- [ ] Advanced filtering (generation, stat range, habitat)
- [ ] MongoDB integration + Team Builder
- [ ] Redis cache replacement
- [ ] Swagger / OpenAPI documentation

---

## 📜 License

ISC — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built as a structured learning project — from HTTP fundamentals to production-grade Node.js backend engineering.

Data provided by [pokeapi.co](https://pokeapi.co)

</div>
