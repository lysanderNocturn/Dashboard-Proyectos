# Instrucciones para Subir a GitHub

## Pasos para crear el repositorio en GitHub

### 1. Ve a GitHub
- Abre tu navegador y ve a https://github.com
- Inicia sesión con tu cuenta `lysanderNocturn`

### 2. Crea un Nuevo Repositorio
- Haz clic en el botón **"+"** en la esquina superior derecha
- Selecciona **"New repository"**
- Completa los campos:
  - **Repository name**: `Dashboard-Proyectos`
  - **Description**: `Sistema de gestión de proyectos institucionales con autenticación y control de roles`
  - **Visibility**: Público o Privado (según prefieras)
  - **NO** marques "Initialize this repository with a README" (ya tenemos uno)
- Haz clic en **"Create repository"**

### 3. Sube el Código

Abre una terminal en VS Code (Ctrl+`) y ejecuta estos comandos:

```bash
cd "C:/Users/Fam-lool/Documents/Mejora"
git branch -M main
git push -u origin main
```

Cuando te pida credenciales, usa:
- **Username**: `lysanderNocturn`
- **Password**: Usa un **Personal Access Token** (no tu contraseña de GitHub)

### 4. Crear un Personal Access Token (si es necesario)

Si no tienes un token:
1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Haz clic en "Generate new token (classic)"
3. Dale un nombre como "Dashboard-Proyectos"
4. Selecciona el scope `repo` (acceso completo a repositorios)
5. Genera el token y guárdalo (solo se muestra una vez)
6. Usa este token como contraseña cuando hagas push

### 5. Verifica el Repositorio

Una vez completado el push, visita:
```
https://github.com/lysanderNocturn/Dashboard-Proyectos
```

Deberías ver todos los archivos del proyecto.

## Estado Actual del Repositorio Local

```bash
# Ver el estado del repositorio
git status

# Ver los commits realizados
git log --oneline

# Ver los remotos configurados
git remote -v
```

## Si Necesitas Hacer Cambios

```bash
# Agregar cambios
git add .

# Crear commit
git commit -m "Descripción de los cambios"

# Subir cambios
git push
```

## Información del Proyecto

- **Nombre del Repositorio**: Dashboard-Proyectos
- **Usuario**: lysanderNocturn
- **Email configurado**: posadanomuertos@gmail.com
- **Total de archivos**: 62 archivos
- **Commits realizados**: 2
  - Initial commit: Dashboard de Proyectos con autenticación y gestión de perfiles
  - Add project README with documentation

## Contacto

Si tienes problemas, contacta a: posadanomuertos@gmail.com
