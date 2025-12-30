# OpenJornada Webapp

Aplicación web para trabajadores del sistema OpenJornada, construida con React, TypeScript y Vite.

## 🎯 Características

- **React 18**: Biblioteca UI moderna
- **TypeScript**: Type-safety completo
- **Vite**: Build tool ultra-rápido con HMR
- **Tailwind CSS**: Framework CSS utility-first
- **Axios**: Cliente HTTP con interceptores
- **React Router**: Navegación entre vistas
- **React Hot Toast**: Notificaciones elegantes
- **Auto-autenticación**: Gestión automática de tokens JWT
- **Detección de Zona Horaria**: Automática del navegador

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### URLs

- **Desarrollo**: http://localhost:5173
- **Producción**: Configurar según tu deployment

## 📦 Estructura del Proyecto

```
openjornada-webapp/
├── src/
│   ├── components/         # Componentes React
│   │   ├── Login.tsx      # Autenticación de trabajador
│   │   ├── Dashboard.tsx  # Menú principal
│   │   ├── CreateTimeRecord.tsx  # Registrar entrada/salida
│   │   ├── CreateIncident.tsx    # Reportar incidencias
│   │   ├── Settings.tsx          # Cambio de contraseña
│   │   ├── ForgotPassword.tsx    # Recuperar contraseña
│   │   └── ResetPassword.tsx     # Restablecer contraseña
│   ├── services/
│   │   └── api.ts         # Cliente API con Axios
│   ├── types/
│   │   └── index.ts       # Definiciones TypeScript
│   ├── App.tsx            # Componente raíz con Router
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── public/                # Archivos estáticos
├── .env.example          # Variables de entorno ejemplo
├── vite.config.ts        # Configuración Vite
├── tailwind.config.js    # Configuración Tailwind
└── package.json          # Dependencias
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# API Backend URL
VITE_API_URL=http://localhost:8000

# Credenciales de API para autenticación JWT
VITE_API_USERNAME=admin
VITE_API_PASSWORD=your_password

# Branding
VITE_APP_NAME=OpenJornada
VITE_APP_LOGO=/logo.png
```

### Branding Personalizado

Puedes personalizar la aplicación con tu propio branding:

1. **Nombre de la app**: Variable `VITE_APP_NAME`
2. **Logo**: Variable `VITE_APP_LOGO` (ruta a imagen en `/public`)
3. **Colores**: Modificar en `tailwind.config.js`

## 🎨 Componentes Principales

### Login (`Login.tsx`)
- Formulario de autenticación para trabajadores
- Validación de email/password
- Link a recuperación de contraseña
- Diseño responsive con logo y branding

### Dashboard (`Dashboard.tsx`)
- Menú principal con tres opciones:
  - Crear registro de jornada
  - Crear incidencia
  - Configuración (cambio de contraseña)
- Header con nombre del trabajador y botón logout

### CreateTimeRecord (`CreateTimeRecord.tsx`)
- Selector de empresa (solo empresas asociadas al trabajador)
- Botón único que determina automáticamente si es entrada o salida
- Validación: no permite entrada en empresa B si hay entrada abierta en empresa A
- Muestra información del registro creado
- Detección automática de zona horaria

### CreateIncident (`CreateIncident.tsx`)
- Formulario para reportar incidencias
- Campo de descripción con validación
- Mensaje de confirmación al enviar

### Settings (`Settings.tsx`)
- Formulario de cambio de contraseña
- Validación: contraseña actual, nueva contraseña (mín. 6 caracteres)
- Confirmación de nueva contraseña

### ForgotPassword (`ForgotPassword.tsx`)
- Solicitud de recuperación de contraseña
- Envía email con token de reset
- Rate limiting: máximo 3 intentos por hora

### ResetPassword (`ResetPassword.tsx`)
- Formulario para establecer nueva contraseña
- Valida token de recuperación
- Redirect automático al login tras éxito

## 🔐 Autenticación

La aplicación usa un sistema de doble autenticación:

### 1. Autenticación JWT (API)
- La webapp se autentica con el backend usando credenciales de `.env`
- Obtiene un JWT token que se renueva automáticamente
- Usado para todas las llamadas a la API

### 2. Autenticación de Trabajador
- El trabajador se autentica con su email/password personal
- Las credenciales se envían en cada request que requiere identificación
- No se almacena JWT para el trabajador

### Auto-refresh de Token

El servicio API (`api.ts`) incluye un interceptor Axios que:
- Detecta respuestas 401 (Unauthorized)
- Renueva automáticamente el JWT token
- Reintenta la petición original
- Maneja errores de autenticación

## 🌐 Rutas de la Aplicación

```
/ → Login o Dashboard (según estado de autenticación)
/forgot-password → Recuperar contraseña
/reset-password/:token → Restablecer contraseña
```

## 📡 Comunicación con API

### Cliente API (`services/api.ts`)

Singleton que gestiona todas las comunicaciones:

```typescript
// Crear registro de jornada
apiService.createTimeRecord({
  email: 'worker@example.com',
  password: 'password123',
  company_id: 'company-id'
})

// Obtener empresas del trabajador
apiService.getWorkerCompanies(email, password)

// Crear incidencia
apiService.createIncident({
  email: 'worker@example.com',
  password: 'password123',
  description: 'Descripción de la incidencia'
})

// Cambiar contraseña
apiService.changePassword({
  email: 'worker@example.com',
  current_password: 'old123',
  new_password: 'new456'
})

// Recuperar contraseña
apiService.forgotPassword({ email: 'worker@example.com' })

// Restablecer contraseña
apiService.resetPassword({
  token: 'reset-token',
  new_password: 'new123'
})
```

## 🎨 Estilos

### Tailwind CSS

La aplicación usa Tailwind CSS para todos los estilos:

```jsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Botón
</button>
```

### Personalización de Colores

Modifica `tailwind.config.js` para cambiar la paleta:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        // ...tus colores
      }
    }
  }
}
```

## 🚀 Deployment

### Build para Producción

```bash
# Build
npm run build

# Los archivos estarán en dist/
```

### Servir con Nginx

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

### 🐳 Imagen Docker

La imagen oficial está disponible en GitHub Container Registry:

```bash
# Última versión
docker pull ghcr.io/openjornada/openjornada-trabajadores:latest

# Versión específica
docker pull ghcr.io/openjornada/openjornada-trabajadores:1.0.0
```

**Plataformas soportadas:** linux/amd64, linux/arm64

### Variables de Entorno en Docker

La imagen soporta dos tipos de variables:

#### Variables Runtime (configurables en docker-compose)

Estas variables se pueden cambiar **sin reconstruir la imagen**:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL de la API | (requerida) |
| `VITE_API_USERNAME` | Usuario para auth JWT | (requerida) |
| `VITE_API_PASSWORD` | Contraseña para auth JWT | (requerida) |
| `VITE_APP_NAME` | Nombre de la aplicación | `OpenJornada` |
| `VITE_APP_LOGO` | Ruta al logo | `/logo.png` |

```yaml
# docker-compose.yml
services:
  webapp:
    image: ghcr.io/openjornada/openjornada-trabajadores:latest
    environment:
      - VITE_API_URL=https://mi-dominio.com/api
      - VITE_API_USERNAME=webapp-user
      - VITE_API_PASSWORD=mi-password-seguro
      - VITE_APP_NAME=Mi Empresa
      - VITE_APP_LOGO=/mi-logo.png
```

#### Variables Build-time (requieren reconstruir imagen)

Estas variables se configuran en **GitHub Actions** como repository variables:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_BASE_PATH` | Path base para routing (ej: `/trabajadores`) | `/` |

Para cambiar el `basePath`, actualiza la variable en GitHub → Settings → Secrets and variables → Actions → Variables, y ejecuta el workflow.

### Cómo funciona

La imagen usa un `docker-entrypoint.sh` que reemplaza placeholders con los valores de las variables de entorno al iniciar el contenedor. Esto permite usar la misma imagen en diferentes entornos.

### Docker Compose

```bash
# Usando docker-compose
docker-compose up -d

# O construir manualmente
docker build -t openjornada-trabajadores .
docker run -p 80:80 openjornada-trabajadores
```

## 🔍 Debugging

### Ver logs en consola del navegador

La aplicación muestra errores detallados en la consola:

```javascript
console.log('API Response:', response)
console.error('Error:', error)
```

### Verificar variables de entorno

En desarrollo, verifica que las variables están cargadas:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)
```

## 🧪 Testing

```bash
# Ejecutar linter
npm run lint

# Type checking
npx tsc --noEmit
```

## 🌍 Internacionalización

Actualmente la aplicación está en español. Para añadir otros idiomas:

1. Instalar `react-i18next`
2. Crear archivos de traducción en `/locales`
3. Envolver componentes con `<Trans>`

## 📱 Progressive Web App (PWA)

Para convertir en PWA:

1. Instalar `vite-plugin-pwa`
2. Configurar en `vite.config.ts`
3. Añadir manifest.json
4. Implementar service worker

## 🎯 Mejoras Futuras

- [ ] Modo offline con service workers
- [ ] PWA completa
- [ ] Notificaciones push
- [ ] Historial de registros del trabajador
- [ ] Modo oscuro
- [ ] Múltiples idiomas
- [ ] Tests automatizados
- [ ] Accesibilidad mejorada

## 🐛 Issues Conocidos

Ninguno actualmente. Reporta issues en GitHub.

## 📄 Licencia

GNU Affero General Public License v3.0 (AGPL-3.0) - Ver archivo LICENSE en la raíz del proyecto.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue antes de hacer cambios grandes.

## 🔗 Enlaces

- **Sitio web**: [www.openjornada.es](https://www.openjornada.es)
- **Email**: info@openjornada.es

---

Parte del proyecto [OpenJornada](https://www.openjornada.es)

