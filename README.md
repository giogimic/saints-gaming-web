# Saints Gaming App

A modern Next.js + shadcn/ui application for a gaming community, featuring server management, modpack distribution, and community features.

## Features

- 🎮 Modern UI with glass-morphism and gradient effects
- 🔐 Authentication (Email/Password, Steam)
- 👤 User profiles with activity tracking
- 🎮 Game server management
- 📦 Modpack distribution
- 💬 Community features
- ✍️ Rich text editor for content
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
- React 19.1.0
- TypeScript 5.3.3
- Tailwind CSS 3.4.1
- shadcn/ui
- Prisma (SQLite)
- NextAuth.js 4.24.7
- Framer Motion
- TipTap (Rich Text Editor)
- ProseMirror
- Radix UI
- Lucide Icons

## Prerequisites

- Node.js 18.17 or later
- pnpm 8.0 or later
- SQLite 3

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/saintsgaming-app.git
cd saintsgaming-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed

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
pnpm dlx shadcn-ui@latest add hover-card
pnpm dlx shadcn-ui@latest add command
pnpm dlx shadcn-ui@latest add tooltip
pnpm dlx shadcn-ui@latest add scroll-area
pnpm dlx shadcn-ui@latest add separator
pnpm dlx shadcn-ui@latest add slider
pnpm dlx shadcn-ui@latest add switch
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

# Site Settings
NEXT_PUBLIC_SITE_NAME="Saints Gaming"
NEXT_PUBLIC_SITE_DESCRIPTION="Your Premier Modded Gaming Community"
```

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── admin/          # Admin pages
│   ├── auth/           # Authentication pages
│   ├── (tabs)/         # Main app tabs
│   └── components/     # App-specific components
├── components/         # React components
│   ├── ui/            # UI components
│   └── shared/        # Shared components
├── lib/               # Utility functions
│   ├── auth.ts       # Authentication utilities
│   ├── prisma.ts     # Database client
│   └── utils.ts      # Helper functions
├── prisma/            # Database schema
│   ├── schema.prisma  # Database schema
│   ├── migrations/    # Database migrations
│   └── seed.ts       # Seed data
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
pnpm prisma migrate dev

# Seed the database
pnpm prisma db seed

# Open Prisma Studio
pnpm prisma studio
```

## Content Management

The app includes a content management system for:
- Game server information
- Modpack details
- Community news
- User profiles
- Site settings

Each content type has its own API route and management interface.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License
MIT