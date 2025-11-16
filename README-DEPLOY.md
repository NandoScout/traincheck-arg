# Guía de Deploy - Bot de Telegram

## Opciones de Deploy Gratuito

### 🚂 Railway (Recomendado)

**Railway** es la opción más fácil y confiable para bots de Telegram.

#### Pasos para deploy en Railway:

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Regístrate con GitHub (gratis)

2. **Conectar tu repositorio**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige este repositorio

3. **Configurar variables de entorno**
   - En el dashboard de Railway, ve a "Variables"
   - Agrega estas variables:
     - `TELEGRAM_BOT_TOKEN` - Tu token del bot de Telegram
     - `TELEGRAM_DEFAULT_CHAT_ID` - ID del chat por defecto
     - `DEFAULT_TOKEN` - Token de sesión por defecto

4. **Deploy automático**
   - Railway detectará automáticamente que es un proyecto Node.js
   - El deploy se hará automáticamente cuando hagas push a GitHub

**Ventajas:**
- ✅ Plan gratuito generoso ($5 de crédito/mes)
- ✅ Siempre activo (no se duerme)
- ✅ Deploy automático desde GitHub
- ✅ Muy fácil de usar

---

### 🌐 Render

**Render** también es una buena opción, pero el plan gratuito tiene limitaciones.

#### Pasos para deploy en Render:

1. **Crear cuenta en Render**
   - Ve a https://render.com
   - Regístrate con GitHub

2. **Crear nuevo Web Service**
   - Haz clic en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub

3. **Configuración:**
   - **Name**: `traincheck-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Variables de entorno:**
   - Agrega las mismas variables que en Railway

**Limitaciones del plan gratuito:**
- ⚠️ Se duerme después de 15 minutos de inactividad
- ⚠️ Puede tardar 30-60 segundos en despertar

---

### 🚀 Fly.io

**Fly.io** es otra opción gratuita con buena performance.

#### Pasos para deploy en Fly.io:

1. **Instalar Fly CLI:**
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Crear app:**
   ```bash
   fly launch
   ```

4. **Configurar variables:**
   ```bash
   fly secrets set TELEGRAM_BOT_TOKEN=tu_token
   fly secrets set TELEGRAM_DEFAULT_CHAT_ID=tu_chat_id
   fly secrets set DEFAULT_TOKEN=tu_token
   ```

---

### 🔵 Koyeb

**Koyeb** ofrece un plan gratuito siempre activo.

#### Pasos para deploy en Koyeb:

1. Ve a https://www.koyeb.com
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. Deploy automático

---

## Variables de Entorno Requeridas

Todas las plataformas necesitan estas variables:

- `TELEGRAM_BOT_TOKEN` - Token de tu bot de Telegram (obtener de @BotFather)
- `TELEGRAM_DEFAULT_CHAT_ID` - ID del chat donde enviar mensajes
- `DEFAULT_TOKEN` - Token de sesión para las consultas

---

## Recomendación Final

**Usa Railway** - Es la opción más simple y confiable para bots de Telegram que necesitan estar siempre activos.

