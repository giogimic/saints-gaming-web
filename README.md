# Saints Gaming App

A Next.js + shadcn/ui starter app with forum functionality.

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
pnpm prisma db push

# Create an admin user
pnpm create-admin

# Start the development server
pnpm dev
```

## Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma (SQLite)
- NextAuth.js
- TipTap (Rich Text Editor)
- ProseMirror

## Features

- Authentication (Email/Password, Steam)
- User profiles
- Forum system with categories and threads
- Rich text editor for posts
- Nested comments
- Search functionality
- Recent activity feed
- Admin dashboard
- Responsive design

## Additional Setup

### Required UI Components

Install these shadcn/ui components:

```bash
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add alert-dialog
pnpm dlx shadcn-ui@latest add select
```

### Database Setup

1. The database will be automatically initialized when you run `pnpm prisma db push`
2. Create an admin user using `pnpm create-admin`
3. The forum categories will be created automatically on first run

### Rich Text Editor Setup

The forum uses TipTap with ProseMirror for the rich text editor. Make sure you have all the required dependencies installed:

```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
pnpm add prosemirror-adapter prosemirror-state prosemirror-view
```

### Environment Variables

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

## Deployment

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

## Development

- Run `pnpm dev` for development
- Run `pnpm build` to create a production build
- Run `pnpm start` to start the production server

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 📝 License
MIT