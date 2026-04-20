> 🇪🇸 [Leer en español](README.md)

# OpenJornada Webapp

Web application for workers in the OpenJornada system, built with React, TypeScript, and Vite.

## 🎯 Features

- **React 18**: Modern UI library
- **TypeScript**: Full type-safety
- **Vite**: Ultra-fast build tool with HMR
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client with interceptors
- **React Router**: View navigation
- **React Hot Toast**: Elegant notifications
- **Auto-authentication**: Automatic JWT token management
- **Timezone Detection**: Automatic browser detection

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

### URLs

- **Development**: http://localhost:5173
- **Production**: Configure according to your deployment

## 📦 Project Structure

```
openjornada-webapp/
├── src/
│   ├── components/         # React components
│   │   ├── Login.tsx      # Worker authentication
│   │   ├── Dashboard.tsx  # Main menu
│   │   ├── CreateTimeRecord.tsx  # Clock in/out
│   │   ├── CreateIncident.tsx    # Report incidents
│   │   ├── Settings.tsx          # Change password
│   │   ├── ForgotPassword.tsx    # Password recovery
│   │   └── ResetPassword.tsx     # Reset password
│   ├── services/
│   │   └── api.ts         # API client with Axios
│   ├── types/
│   │   └── index.ts       # TypeScript definitions
│   ├── App.tsx            # Root component with Router
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static files
├── .env.example          # Example environment variables
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Backend URL
VITE_API_URL=http://localhost:8000

# API credentials for JWT authentication
VITE_API_USERNAME=admin
VITE_API_PASSWORD=your_password

# Branding
VITE_APP_NAME=OpenJornada
VITE_APP_LOGO=/logo.png
```

### Custom Branding

You can customize the application with your own branding:

1. **App name**: `VITE_APP_NAME` variable
2. **Logo**: `VITE_APP_LOGO` variable (path to image in `/public`)
3. **Colors**: Modify in `tailwind.config.js`

## 🎨 Main Components

### Login (`Login.tsx`)
- Authentication form for workers
- Email/password validation
- Link to password recovery
- Responsive design with logo and branding

### Dashboard (`Dashboard.tsx`)
- Main menu with three options:
  - Create time record
  - Create incident
  - Settings (change password)
- Header with worker name and logout button

### CreateTimeRecord (`CreateTimeRecord.tsx`)
- Company selector (only companies associated with the worker)
- Single button that automatically determines clock-in or clock-out
- Validation: does not allow clock-in at company B if there is an open clock-in at company A
- Displays created record information
- Automatic timezone detection

### CreateIncident (`CreateIncident.tsx`)
- Form for reporting incidents
- Description field with validation
- Confirmation message on submit

### Settings (`Settings.tsx`)
- Password change form
- Validation: current password, new password (min. 6 characters)
- New password confirmation

### ForgotPassword (`ForgotPassword.tsx`)
- Password recovery request
- Sends email with reset token
- Rate limiting: maximum 3 attempts per hour

### ResetPassword (`ResetPassword.tsx`)
- Form to set new password
- Validates recovery token
- Automatic redirect to login after success

## 🔐 Authentication

The application uses a dual authentication system:

### 1. JWT Authentication (API)
- The webapp authenticates with the backend using `.env` credentials
- Obtains a JWT token that is automatically renewed
- Used for all API calls

### 2. Worker Authentication
- The worker authenticates with their personal email/password
- Credentials are sent in every request that requires identification
- No JWT is stored for the worker

### Token Auto-refresh

The API service (`api.ts`) includes an Axios interceptor that:
- Detects 401 (Unauthorized) responses
- Automatically renews the JWT token
- Retries the original request
- Handles authentication errors

## 🌐 Application Routes

```
/ → Login or Dashboard (depending on authentication state)
/forgot-password → Password recovery
/reset-password/:token → Reset password
```

## 📡 API Communication

### API Client (`services/api.ts`)

Singleton that manages all communications:

```typescript
// Create time record
apiService.createTimeRecord({
  email: 'worker@example.com',
  password: 'password123',
  company_id: 'company-id'
})

// Get worker companies
apiService.getWorkerCompanies(email, password)

// Create incident
apiService.createIncident({
  email: 'worker@example.com',
  password: 'password123',
  description: 'Incident description'
})

// Change password
apiService.changePassword({
  email: 'worker@example.com',
  current_password: 'old123',
  new_password: 'new456'
})

// Password recovery
apiService.forgotPassword({ email: 'worker@example.com' })

// Reset password
apiService.resetPassword({
  token: 'reset-token',
  new_password: 'new123'
})
```

## 🎨 Styles

### Tailwind CSS

The application uses Tailwind CSS for all styles:

```jsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button
</button>
```

### Color Customization

Modify `tailwind.config.js` to change the palette:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        // ...your colors
      }
    }
  }
}
```

## 🚀 Deployment

### Production Build

```bash
# Build
npm run build

# Output files will be in dist/
```

### Serve with Nginx

```nginx
server {
    listen 80;
    server_name app.openjornada.com;

    root /path/to/openjornada-webapp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 🐳 Docker Image

The official image is available on GitHub Container Registry:

```bash
# Latest version
docker pull ghcr.io/openjornada/openjornada-trabajadores:latest

# Specific version
docker pull ghcr.io/openjornada/openjornada-trabajadores:1.0.0
```

**Supported platforms:** linux/amd64, linux/arm64

### Docker Environment Variables

The image supports two types of variables:

#### Runtime Variables (configurable in docker-compose)

These variables can be changed **without rebuilding the image**:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API URL | (required) |
| `VITE_API_USERNAME` | User for JWT auth | (required) |
| `VITE_API_PASSWORD` | Password for JWT auth | (required) |
| `VITE_APP_NAME` | Application name | `OpenJornada` |
| `VITE_APP_LOGO` | Path to logo | `/logo.png` |

```yaml
# docker-compose.yml
services:
  webapp:
    image: ghcr.io/openjornada/openjornada-trabajadores:latest
    environment:
      - VITE_API_URL=https://my-domain.com/api
      - VITE_API_USERNAME=webapp-user
      - VITE_API_PASSWORD=my-secure-password
      - VITE_APP_NAME=My Company
      - VITE_APP_LOGO=/my-logo.png
```

#### Build-time Variables (require image rebuild)

These variables are configured in **GitHub Actions** as repository variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BASE_PATH` | Base path for routing (e.g., `/trabajadores`) | `/` |

To change the `basePath`, update the variable in GitHub → Settings → Secrets and variables → Actions → Variables, and run the workflow.

### How It Works

The image uses a `docker-entrypoint.sh` that replaces placeholders with environment variable values when the container starts. This allows using the same image in different environments.

### Docker Compose

```bash
# Using docker-compose
docker-compose up -d

# Or build manually
docker build -t openjornada-trabajadores .
docker run -p 80:80 openjornada-trabajadores
```

## 🔍 Debugging

### View logs in browser console

The application shows detailed errors in the console:

```javascript
console.log('API Response:', response)
console.error('Error:', error)
```

### Verify environment variables

In development, verify that variables are loaded:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)
```

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## 🌍 Internationalization

Currently the application is in Spanish. To add other languages:

1. Install `react-i18next`
2. Create translation files in `/locales`
3. Wrap components with `<Trans>`

## 📱 Progressive Web App (PWA)

To convert to a PWA:

1. Install `vite-plugin-pwa`
2. Configure in `vite.config.ts`
3. Add manifest.json
4. Implement service worker

## 🎯 Future Improvements

- [ ] Offline mode with service workers
- [ ] Full PWA
- [ ] Push notifications
- [ ] Worker time record history
- [ ] Dark mode
- [ ] Multiple languages
- [ ] Automated tests
- [ ] Improved accessibility

## 🐛 Known Issues

None currently. Report issues on GitHub.

## 📄 License

GNU Affero General Public License v3.0 (AGPL-3.0) - See LICENSE file in the project root.

## 👨‍💻 Author

OpenJornada is a project developed by **[HappyAndroids](https://happyandroids.com)**.

## 🤝 Contributions

Contributions are welcome. Please open an issue before making large changes.

## 🔗 Links

- **Website**: [www.openjornada.es](https://www.openjornada.es)
- **Developed by**: [HappyAndroids](https://happyandroids.com)
- **Email**: info@openjornada.es

---

A project by [HappyAndroids](https://happyandroids.com) | [OpenJornada](https://www.openjornada.es)
