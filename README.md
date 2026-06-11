# Unified Social API
![Unified Social API](https://img.shields.io/badge/Unified_Social-API-purple?style=for-the-badge&logo=share&logoColor=white)

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7+-red?logo=redis)
![License](https://img.shields.io/badge/License-MIT-yellow)

> Post once, Reach everywhere

Managing multiple social media API integrations is tedious...
Unified Social API lets you publish your posts in one go. No more integrating multiple APIs every time you decide to post to a new platform. The API is built with FastAPI for high-performance async processing.

## Tech Stack

**Backend**

- FastAPI
- SQLAlchemy 2.0 — async ORM
- asyncpg — async Postgresql driver
- httpx — async HTTP client for platform API calls
- Pydantic — data validation and settings management
- Alembic — database migrations

**Database & Cache**

- Postgresql — primary database
- Redis — caching, rate limiting and token storage

**Auth & Security**
- PyJWT + PKCE — JWT token generation and OAuth security
- passlib(Argon2) — password hashing 
- OAuth2 — social login (Google, GitHub) and platform linking (X, Discord)

## Features

- Publish to X and Discord with a single API call (more platforms coming)
- OAuth2 social account linking with secure PKCE flow
- Concurrent platform posting using asyncio
- Automatic token refresh — never worry about expired credentials
- Sliding window rate limiting per user and IP.
- Multiple authentication options — email/password, Google, GitHub
- Retry failed platform posts without resubmitting content

## Prerequisites

### Runtime/ Language
- Python >= 3.11

### Package Manager
- uv >= 0.11.20
- npm >= 11.16.0 (for the small frontend)

### Infrastructure/ Platform
- Docker
- Linux/Unix

### API Credentials

API credentials for social login

- Google
- Github

API credentials for platform integration

- Discord
- X

## Getting Started

1. Clone the repo
```bash
git clone https://github.com/the-coderbee/unified-social-api.git
```

2. Setup environment and variables
### Backend
```bash
# navigate to backend dir
cd unified-social-api/backend/
cp .env.example .env
```

### Frontend
```bash
# navigate to frontend dir
cd unified-social-api/frontend/
npm install # this handle installing the project and the dependencies
cp .env.example .env
```

then edit .env with your credentials

3. Install dependencies
*Must have docker installed based on your platform.

```bash
# navigate to backend dir
cd unified-social-api/backend/
uv sync
```

4. Start Infrastructre
```bash
# navigate to docker dir
cd unified-social-api/docker/
# run docker
docker compose up -d
```

5. Run migrations
```bash
# run from the backend root
uv run alembic upgrade head
```

6. Start the server
Use two terminals or tabs (Development only)

### Backend
```bash
# run from the backend root
uv run uvicorn src.main:app --reload
```

### Frontend
```bash
# run from the frontend root
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

### Application
| Variable | Description | Required |
|----------|-------------|----------|
| `CORS_ORIGINS` | A space separated string containing the urls to allow. | Yes |
| `SECRET_KEY` | Secret key used for signing JWT tokens. Use a long random string. | Yes |
| `ALGORITHM` | Alogrithm to use for JWT Encoding. | Optional |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | The expiry time for access tokens in seconds. | Optional |

### Database & Cache
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | The url to your database. It must have the proper database driver mentioned. In this case postgresql+asyncpg | Yes |
| `REDIS_URL` | The url to your redis instance | Yes | 

### Google OAuth
| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | The client ID of your google application | Yes | 
| `GOOGLE_CLIENT_SECRET` | The client secret of your google application | Yes | 
| `GOOGLE_REDIRECT_URI` | The redirect uri set in your google application | Yes | 

### GitHub OAuth
| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | The client ID of your github application | Yes | 
| `GITHUB_CLIENT_SECRET` | The client secret of your github application | Yes | 
| `GITHUB_REDIRECT_URI` | The redirect uri set in your github application | Yes | 

### Platform (Discord OAuth)
| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_CLIENT_ID` | The client ID of your discord application | Yes | 
| `DISCORD_CLIENT_SECRET` | The client secret of your discord application | Yes | 
| `DISCORD_REDIRECT_URI` | The redirect uri set in your discord application | Yes | 

### Platform (X OAuth)
| Variable | Description | Required |
|----------|-------------|----------|
| `X_CLIENT_ID` | The client ID of your x application | Yes | 
| `X_CLIENT_SECRET` | The client secret of your x application | Yes | 
| `X_REDIRECT_URI` | The redirect uri set in your x application | Yes | 

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
|`VITE_API_URL` | The url to your backend api | Yes |

## API Overview

The API Endpoints:

### Authentication
`[POST] /api/v1/auth/register` — Register a new user with email and password. \
`[POST] /api/v1/auth/login` — Log user in with email and password. \
`[POST] /api/v1/auth/refresh` — Generate new tokens using the refresh token. Called automatically on token expire. \
`[POST] /api/v1/auth/logout` — Log user out and revoke token access. \
`[GET] /api/v1/auth/google/login` — Log user in using Google's OAuth2. \
`[GET] /api/v1/auth/google/callback` — OAuth2 callback handler. Called automatically by Google after user authorization. Exchanges code for tokens and returns JWT. \
`[GET] /api/v1/auth/github/login` — Log user in using GitHub's OAuth2. \
`[GET] /api/v1/auth/github/callback` — OAuth2 callback handler. Called automatically by GitHub after user authorization. Exchanges code for tokens and returns JWT. \

### Users
`[GET] /api/v1/users/me` — Get the currently logged in user. \

### Social Accounts
`[GET] /api/v1/social/login/{platform_name}` — Get login url for the specified platform. \
`[POST] /api/v1/social/{platform_name}/link` — Link the specified social platform. \
`[DELETE] /api/v1/social/{platform_name}/unlink` — Unlink the specified social platform. \
`[GET] /api/v1/social/accounts` — Get all linked social accounts. \

### Posts
`[POST] /api/v1/posts/` — Create new post. \
`[GET] /api/v1/posts/` — Get all posts. Filters can be applied through params. \
`[POST] /api/v1/posts/{post_id}/retry` — Retry a failed post. \
`[GET] /api/v1/posts/{post_id}` — Get a specific post by its ID. \

## Architecture

### Vertically Scaled Module Structure
It follows a four-file module pattern i.e. models, schemas, router, repository in a single module. The reasoning? When we add a new feature we just add another module but without it if we would have to modify model, schema, repository and router stored at different places.

We would also have to assume the files will start getting bigger and bigger we store all in a single file.

### Repository Pattern
We separate db queries from route handlers and this keeps things structured and isolated making it job specific. Repository files have the db queries in it so whenever we find database query error we know where to find. Similarly for router files, the job is to manage the endpoint and handle upper layer logic.

### Transaction Pattern
Transaction pattern means we dont commit in repository logic. Why? Because if we commit and we encounter errors we are presented with a situation with bad data in our database. we dont want that. Instead, if we just flush to db and only commit when endpoint logic is successful or else we rollback. Keeping this possibility open helps us avoid the database integrity.

### Service Layer
By using the service layer approach for platform logic we isolate all the business logic for integrating external API and handling their security to a module. This makes the system loosely coupled. Issues with external API wont impact our router endpoints.


### Abstract Base Classes
We have Abstract classes for AuthProvider and SocialPlatform. This helps us enforce the necessary implementations before hand. Since the platforms follow similar pattern, whenever we add new platforms we know what needs to be done. And instead of running into error at runtime we know it before so if we forget to implement it wont run.

### Redis Usage
Redis serves three purposes — fast shared state across multiple server instances, automatic TTL-based cleanup for temporary data like PKCE verifiers and refresh tokens, and efficient sorted sets for sliding window rate limiting.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
