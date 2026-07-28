# AMSOIL

Sistema de gestión de inventario y facturación. Frontend en HTML/CSS/JS plano y backend en Django + PostgreSQL.

## Estructura

```
fronted/    Frontend (HTML, CSS, JS)
backend/    API en Django + PostgreSQL
```

## Backend (Django + PostgreSQL)

### 1. Crear la base de datos

Con PostgreSQL instalado y corriendo localmente:

```bash
createdb amsoil
# o desde psql:
# CREATE DATABASE amsoil;
```

### 2. Configurar el entorno

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt

copy .env.example .env       # Windows
# cp .env.example .env       # Linux/Mac
```

Edita `backend/.env` con los datos de tu PostgreSQL (usuario, contraseña, host, puerto, nombre de base) si difieren de los valores por defecto.

### 3. Migrar y crear un usuario

```bash
python manage.py migrate
python manage.py seed_demo      # crea un usuario de prueba: codigo=admin, password=admin123
# o, para crear el tuyo propio:
python manage.py createsuperuser
```

### 4. Levantar el servidor

```bash
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/` y el admin de Django en `http://127.0.0.1:8000/admin/`.

### Endpoints principales

| Método | Ruta                    | Descripción                              |
|--------|-------------------------|-------------------------------------------|
| POST   | `/api/auth/login/`      | Login (codigo + password) → token         |
| POST   | `/api/auth/logout/`     | Invalida el token actual                  |
| GET    | `/api/productos/`       | Lista productos (filtros: `categoria`, `search`) |
| POST   | `/api/productos/`       | Crea un producto                          |
| DELETE | `/api/productos/<codigo>/` | Elimina un producto                    |
| GET    | `/api/facturas/`        | Lista facturas (con sus líneas)           |
| POST   | `/api/facturas/`        | Crea una factura (`{"lineas":[{"codigo":"...","cantidad":1}]}`) |
| GET    | `/api/ajustes/`         | Ajustes (idioma/país) del usuario actual  |
| PUT    | `/api/ajustes/`         | Actualiza ajustes del usuario actual      |

Todas las rutas salvo `login` requieren el header `Authorization: Token <token>`.

## Frontend

Es HTML/CSS/JS estático, sin build. Puede abrirse directamente en el navegador (doble clic en `fronted/registro.html`) o servirse con cualquier servidor estático, por ejemplo:

```bash
cd fronted
python -m http.server 5500
```

El frontend llama a la API en `http://127.0.0.1:8000/api` (configurable en `fronted/js/api.js`, constante `API_BASE_URL`). Con el backend corriendo, entra por `registro.html`, inicia sesión con el usuario creado en el paso anterior y navega a `principal.html`.