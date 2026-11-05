# BookNook — Client

**A neighborhood library on the web. Discover a good read, share a book, and keep stories moving.**

[![Visit BookNook](https://img.shields.io/badge/Visit-BookNook-537861?style=for-the-badge)](https://book-nook-client-cyan.vercel.app/)
[![Client repository](https://img.shields.io/badge/GitHub-Client-181717?style=for-the-badge&logo=github)](https://github.com/BadhonPain/BookNook-client)
[![API repository](https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github)](https://github.com/BadhonPain/BookNook-server)

**Live website:** [book-nook-client-cyan.vercel.app](https://book-nook-client-cyan.vercel.app/)

BookNook is a community-powered book-sharing app. Readers can explore the library, lend their own titles, borrow available books, and get suggestions informed by their reading history and interests.

## What you can do

- **Explore the library:** Browse and search book listings, view book details, and discover featured titles, new arrivals, and the most-borrowed books.
- **Get tailored suggestions:** See recommendations based on borrowed books, favorite categories, and author or topic interests.
- **Share books:** Add a title with its details and cover image, then manage your own listings.
- **Borrow and return:** Borrow an available book, track active loans and return dates, and view your borrowing history.
- **Manage your account:** Register or sign in with email and password, or use Google sign-in. Update your profile details and photo.
- **Choose your theme:** Switch between light and dark modes; your preference is saved in your browser.
- **Read on any screen:** Responsive layouts, helpful loading and error feedback, and accessible navigation support desktop and mobile.

## Projects

| Project | Description |
| --- | --- |
| [BookNook Client](https://github.com/BadhonPain/BookNook-client) | Next.js web application |
| [BookNook API](https://github.com/BadhonPain/BookNook-server) | Express and MongoDB REST API |

## Technology

- Next.js 16 with the App Router and React 19
- TypeScript
- Swiper for the homepage book shelves and hero carousel
- Better Auth for account management and signed JWTs
- Express API with MongoDB

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB, local or hosted

### 1. Configure the client

From the client repository:

```powershell
npm install
Copy-Item .env.example .env.local
```

Set the required values in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_URL` | Base URL of the client application (locally, `http://localhost:3000`). |
| `BETTER_AUTH_SECRET` | Private Better Auth secret. Use a random value of at least 32 characters. |
| `MONGODB_URI` | MongoDB connection string used by Better Auth. |
| `MONGODB_DATABASE` | Database name used by the client and API. |
| `JWT_AUDIENCE` | Expected API token audience; defaults to `booknook-api`. |
| `NEXT_PUBLIC_AUTH_URL` | Browser-visible Better Auth URL; locally, `http://localhost:3000`. |
| `NEXT_PUBLIC_API_URL` | Base URL of the BookNook API; locally, `http://localhost:5000`. |
| `GOOGLE_CLIENT_ID` | Optional Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Optional Google OAuth client secret. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB API key for uploading book covers and profile photos. |

Generate a secret locally:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 2. Start the API

In a second terminal, from the [BookNook API repository](https://github.com/BadhonPain/BookNook-server):

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Configure `MONGODB_URI` in the API's `.env`. For local development, the API defaults to `http://localhost:5000` and allows the client at `http://localhost:3000`.

### 3. Start the client

From the client repository:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |

## Deployment

The client and API are deployed separately. The live client is available at [book-nook-client-cyan.vercel.app](https://book-nook-client-cyan.vercel.app/).

For production, configure the environment variables in the respective hosting providers. Ensure the client uses the deployed API URL, the API permits the deployed client origin, and the API's `BETTER_AUTH_URL`, `AUTH_JWKS_URL`, and `JWT_AUDIENCE` match the Better Auth configuration. Add the deployed callback URL to the Google OAuth configuration when Google sign-in is enabled.

Never commit `.env`, `.env.local`, credentials, or API keys. Use `.env.example` as the safe template.

## Contributing

1. Fork the repository and create a feature branch.
2. Keep changes focused and run `npm run lint` and `npm run build`.
3. Open a pull request describing the change and how it was verified.

## License

No license is currently specified. Contact the repository owner before redistributing or reusing this project.
