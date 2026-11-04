# BookNook

BookNook is a small online library for discovering, sharing, borrowing, and returning books.

## Features

- Browse a responsive, searchable catalog with featured, most-borrowed, and newly added book carousels.
- Register with email and password or sign in with Google.
- Add and edit book listings with an uploaded cover image.
- Borrow available copies, track return dates, and return books from your account.
- Manage your own listings with a confirmation step before deleting.
- See helpful loading and error feedback on mobile, tablet, and desktop.

The homepage's most-borrowed shelf is based on actual borrow records; it stays empty until a book has been borrowed.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and fill in the values below.
3. Install dependencies with `npm install`.
4. Start the server from the [BookNook server repository](https://github.com/BadhonPain/BookNook-server) using `npm run server:dev`.
5. Start this client with `npm run dev`, then open `http://localhost:3000`.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_URL` | Public base URL of the Next.js application. |
| `BETTER_AUTH_SECRET` | Private BetterAuth signing/encryption secret; use a random value of at least 32 characters. |
| `MONGODB_URI` | MongoDB connection string used by BetterAuth and the API. |
| `MONGODB_DATABASE` | Database name shared by the client authentication and server data. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials from your Google Cloud OAuth client. |
| `JWT_AUDIENCE` | Expected JWT audience for the Express API; defaults to `booknook-api`. |
| `NEXT_PUBLIC_AUTH_URL` | Base URL used by the browser to reach BetterAuth. |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express API. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB API key used to upload book cover images. |

Generate a BetterAuth secret locally with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Keep actual credentials only in `.env.local`; never commit that file. For deployment, configure the same values in the hosting provider's environment settings. The live site URL will be added after deployment.

## Deployment

Deploy the Next.js client and Express API separately. Configure the production application/API URLs, MongoDB access, Google OAuth callback URL, allowed client origin, and image upload key in their respective environment settings before testing authentication and borrowing.
