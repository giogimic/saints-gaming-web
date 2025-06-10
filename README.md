# Saints Gaming App

A modern Next.js + shadcn/ui application with forum functionality, built with cutting-edge UI components and animations.

## Features

- 🎮 Modern UI with glass-morphism and gradient effects
- 🔐 Authentication (Email/Password, Steam)
- 👤 User profiles with activity tracking
- 💬 Forum system with categories and threads
- ✍️ Rich text editor for posts
- 💭 Nested comments
- 🔍 Advanced search functionality
- 📊 Admin dashboard
- 📱 Responsive design
- 🎨 Customizable themes
- ⚡ Performance optimized
- 🔄 Real-time updates
- 🎯 Command palette navigation
- 💫 Smooth animations and transitions

## Tech Stack

- Next.js 15.3.3 (App Router)
- React 19
- TypeScript 5.3.3
- Tailwind CSS 3.4
- shadcn/ui
- Prisma 5.10.2 (SQLite)
- NextAuth.js 4.24.6
- Framer Motion 11.0.8
- TipTap 2.2.4 (Rich Text Editor)
- ProseMirror
- Radix UI
- Lucide Icons

## Prerequisites

- Node.js 18.17 or later
- pnpm 8.0 or later
- SQLite 3

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
pnpm prisma generate
pnpm prisma db push

# Create an admin user
pnpm create-admin

# Start the development server
pnpm dev
```

## Required UI Components

Install these shadcn/ui components:

```bash
# Core components
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add alert-dialog
pnpm dlx shadcn-ui@latest add select

# Modern components
pnpm dlx shadcn-ui@latest add hover-card
pnpm dlx shadcn-ui@latest add command
pnpm dlx shadcn-ui@latest add tooltip
```

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Steam Auth (optional)
STEAM_API_KEY="your-steam-api-key"
```

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── admin/          # Admin pages
│   ├── auth/           # Authentication pages
│   └── forum/          # Forum pages
├── components/         # React components
│   ├── ui/            # UI components
│   ├── forum/         # Forum components
│   └── admin/         # Admin components
├── lib/               # Utility functions
│   ├── auth.ts       # Authentication utilities
│   ├── prisma.ts     # Database client
│   └── utils.ts      # Helper functions
├── prisma/            # Database schema
└── public/            # Static assets
```

## Development

- Run `pnpm dev` for development
- Run `pnpm build` to create a production build
- Run `pnpm start` to start the production server
- Run `pnpm lint` to check for linting issues
- Run `pnpm format` to format code

## Database Management

```bash
# Generate Prisma Client
pnpm prisma generate

# Push schema changes to database
pnpm prisma db push

# Open Prisma Studio
pnpm prisma studio
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License
MIT