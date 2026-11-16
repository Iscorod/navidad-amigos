# 🎄 Navidad con Amigos

Aplicación web responsive para elegir el mejor día de la comida de Navidad. Sin registro. Los datos se guardan en un JSON de un repositorio de GitHub mediante una ruta API de Next.js alojada en Vercel.

## Publicar en Vercel

1. Sube **todos los archivos de esta carpeta** a un repositorio GitHub (por ejemplo, `navidad-amigos`).
2. En GitHub, crea un **fine-grained personal access token** con acceso al repositorio elegido y permiso **Contents: Read and write**. No lo incluyas en el código ni lo compartas.
3. En Vercel: **Add New → Project → Import Git Repository**. Selecciona el repositorio. Framework: **Next.js**.
4. En **Settings → Environment Variables** añade:

   | Variable | Ejemplo |
   | --- | --- |
   | `GITHUB_TOKEN` | `github_pat_...` |
   | `GITHUB_OWNER` | `tu-usuario` |
   | `GITHUB_REPO` | `navidad-amigos` |
   | `GITHUB_BRANCH` | `main` |
   | `GITHUB_DATA_PATH` | `data/disponibilidad.json` |

5. Haz **Deploy**. Si añadiste las variables después de desplegar, ejecuta **Redeploy**.
6. Comparte la URL de Vercel por WhatsApp. No hace falta crear previamente el archivo JSON: la aplicación lo creará en el primer guardado (si el token tiene permisos).

**Importante:** el repositorio puede ser privado. El token se utiliza exclusivamente en el servidor y no se expone al navegador.

## Ejecutar en local

```bash
npm install
cp .env.example .env.local
# Edita .env.local con tus valores
npm run dev
```

Visita http://localhost:3000.

## Uso

- Añade un nombre.
- Selecciona a cualquier amigo desde el desplegable.
- Elige «Libre», «Ocupado» o «Borrar» y toca los días.
- Para renombrar o eliminar personas, abre la pestaña «Amigos».
- Los datos se recargan automáticamente cada 20 segundos y después de cada guardado.
- Los días con más personas libres se resaltan en el calendario.

## Notas técnicas y límites

- **No hay autenticación**, como se ha solicitado. Cualquier persona con el enlace puede modificar o borrar cualquier dato. Evita publicar el enlace abiertamente.
- Los cambios se guardan como commits en GitHub. Se reintenta ante conflictos de escritura, pero con mucha concurrencia podrían aparecer errores temporales; basta con reintentar.
- GitHub tiene límites de API y no es una base de datos ideal para uso masivo; es apropiado para un grupo pequeño de amigos.
- El calendario muestra diciembre del **año actual**. Para fijar un año distinto, modifica `YEAR` en `app/page.tsx`.
- Cada modificación genera un commit. Los datos borrados siguen existiendo en el historial de Git; no uses información sensible.
- El token debe poder escribir en la rama configurada. Si hay protección de rama, utiliza una rama donde el token pueda escribir.
