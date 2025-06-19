# Saints Gaming Web

Many features may not be functional yet working on this still. 
Not meant for use just learning. 

## Tech Stack

- Next.js 13+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Prisma (MariaDB)
- NextAuth.js
- shadcn/ui
- Bun

## Features

- Modern UI with dark mode support
- Server-side rendering
- Type-safe database queries
- Authentication with multiple providers
- Forum system
- News and announcements
- Server status monitoring
- User profiles
- Admin dashboard

## Prerequisites

- Node.js 18+ or Bun
- MariaDB 10.6+
- pnpm

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other settings.

4. Run migrations:
   ```bash
   pnpm run migrate
   ```

5. Start the development server:
   ```bash
   pnpm run dev
   ```

## Database

The application uses MariaDB as its database. Make sure you have MariaDB installed and running before starting the application.

## Development

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run migrate` - Run database migrations
- `pnpm run backup` - Backup database
- `pnpm run restore` - Restore database from backup

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
