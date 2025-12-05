# Kaiienna E-Commerce Platform

Modern e-commerce platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- 🛍️ Full-featured e-commerce functionality
- 👥 User authentication and profiles
- 📦 Product and category management
- 🛒 Shopping cart and checkout
- 📝 Blog system
- 🚚 Shipping methods management
- 💳 Payment processing
- 📊 Admin panel
- 🌐 Russian language support

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **UI Components:** Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/narminasadoffa-prog/kaiiena.git
cd kaiiena
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="your_postgresql_connection_string"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3007"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Create an admin user:
```bash
npm run create-admin
```

6. Run the development server:
```bash
npm run dev
```

The site will be available at [http://localhost:3007](http://localhost:3007)

## Admin Panel

Access the admin panel at [http://localhost:3007/admin](http://localhost:3007/admin)

Default admin credentials (change after first login):
- Email: admin@example.com
- Password: (set during admin creation)

## Project Structure

```
├── app/              # Next.js app directory
│   ├── admin/       # Admin panel pages
│   ├── api/         # API routes
│   ├── auth/        # Authentication pages
│   └── ...          # Public pages
├── components/      # React components
├── lib/             # Utility functions
├── prisma/          # Database schema
└── public/          # Static files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run create-admin` - Create admin user

## License

MIT
