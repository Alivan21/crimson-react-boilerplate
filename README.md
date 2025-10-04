# Crimson React Boilerplate

A modern, production-ready full-stack React boilerplate built with React Router v7, featuring authentication, user management, and a comprehensive admin dashboard.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=flat-square&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## ✨ Features

### 🔐 Authentication & Authorization

- **Login system** with form validation
- **Permission-based access control**
- **Session management** with secure cookies
- **Protected routes** and role-based navigation

### 👥 User Management

- **Complete CRUD operations** for users
- **Advanced filtering** and search functionality
- **Pagination** with customizable page sizes
- **Data table** with sorting and view options
- **User creation** and editing forms with validation

### 🎨 Modern UI/UX

- **Responsive design** built with TailwindCSS
- **shadcn/ui components** for consistent design system
- **Dark/Light theme** support
- **Modern sidebar navigation** with collapsible menu
- **Breadcrumb navigation**
- **Loading states** and error handling
- **Toast notifications**

### 🏗️ Architecture & Development

- **React Router v7** with file-based routing
- **TypeScript** for type safety
- **Server-side rendering (SSR)**
- **Hot Module Replacement (HMR)**
- **TanStack Query** for data fetching and caching
- **React Hook Form** with Zod validation
- **Axios** for HTTP requests
- **Custom hooks** for reusable logic

### 📱 Developer Experience

- **ESLint** and **Prettier** configuration
- **Husky** pre-commit hooks
- **TypeScript path mapping**
- **Development tools** and debugging support
- **Docker** support for containerized deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd react-app-router-sandbox
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📖 Usage

### Authentication

1. Navigate to `/login` to access the login page
2. Use the authentication form to sign in
3. Upon successful login, you'll be redirected to the dashboard

### User Management

- **View Users**: Navigate to `/users` to see the user list
- **Create User**: Click "Create User" or go to `/users/create`
- **Edit User**: Click on any user in the table to edit
- **Filter & Search**: Use the built-in filters and search functionality

### Dashboard

- Access the main dashboard at `/dashboard`
- View analytics and reports (coming soon)
- Navigate through the sidebar menu

## 🏛️ Project Structure

```
src/
├── api/                    # API layer
│   ├── auth/              # Authentication API
│   └── users/             # User management API
├── app/                   # React Router pages
│   ├── (public)/          # Public routes (login, etc.)
│   ├── api/              # API routes
│   └── app/              # Protected app routes
├── components/           # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── providers/        # Context providers
│   ├── sidebar/          # Navigation components
│   └── datatable/        # Table components
├── hooks/               # Custom React hooks
│   ├── api/             # API-related hooks
│   ├── request/         # HTTP request hooks
│   └── shared/          # Shared utility hooks
├── libs/                # Third-party library configurations
├── common/              # Shared constants and types
└── utils/               # Utility functions
```

## 🛠️ Available Scripts

- **`pnpm dev`** - Start development server with HMR
- **`pnpm build`** - Build for production
- **`pnpm start`** - Start production server
- **`pnpm lint`** - Run ESLint with auto-fix
- **`pnpm format`** - Format code with Prettier
- **`pnpm typecheck`** - Run TypeScript type checking

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Add your environment variables here
API_BASE_URL=your-api-url
JWT_SECRET=your-jwt-secret
```

### Customization

- **Theme**: Modify `src/app.css` for global styles
- **Components**: Extend or customize components in `src/components/ui/`
- **API**: Configure API endpoints in `src/api/`
- **Routes**: Add new routes in `src/app/` following the file-based routing convention

## 🚀 Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t crimson-react-app .

# Run the container
docker run -p 3000:3000 crimson-react-app
```

### Manual Deployment

1. **Build the application**

   ```bash
   pnpm build
   ```

2. **Deploy the build folder**
   - Upload `build/` directory to your server
   - Ensure Node.js is installed on the server
   - Run `pnpm start` or use a process manager like PM2

### Supported Platforms

- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Apps**
- **Vercel**
- **Railway**
- **Digital Ocean App Platform**
- **Fly.io**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Routing**: React Router v7
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form + Zod
- **UI Components**: Radix UI + shadcn/ui
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, Husky

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using React Router v7 and modern web technologies.
