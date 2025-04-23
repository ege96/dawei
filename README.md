# Instagram Clone

This is a full-featured Instagram clone built with Next.js and Supabase.

## Features

- User authentication (signup, login)
- User profiles
- Image upload and posting
- Feed with posts from all users
- Likes functionality
- Profile page to view and edit your profile
- Responsive design (mobile and desktop)

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 16+ 
- Supabase account

### Setup Supabase

1. Create a new Supabase project
2. Run the SQL from `supabase/schema.sql` in the Supabase SQL editor to set up the database tables
3. Run the SQL from `supabase/storage.sql` to set up the storage bucket

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── (main)/           # Main app layout routes
│   │   ├── feed/         # Feed page
│   │   ├── profile/      # Profile page
│   │   ├── create/       # Create post page
│   │   └── layout.tsx    # Main layout with navigation
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page (redirects to feed or login)
├── components/           # React components
├── lib/                  # Library code, utilities
├── public/               # Static assets
├── supabase/             # Supabase related files
│   ├── schema.sql        # Database schema
│   └── storage.sql       # Storage configuration
└── utils/                # Utility functions
    └── supabase/         # Supabase client utilities
```

## Deployment

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Finstagram-clone)

Remember to add your environment variables in the Vercel dashboard.
