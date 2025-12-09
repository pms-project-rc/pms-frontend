# Debugging de Autenticación - Guía Rápida

Si después del login eres redirigido inmediatamente a la página de login, sigue estos pasos:

## Paso 1: Verifica el Token en localStorage

Abre la consola del navegador (F12 o Cmd+Shift+I) y ejecuta:

```javascript
// Ver si el token está guardado
console.log(localStorage.getItem('pms_access_token'));
```

**Resultado esperado:** Deberías ver una cadena larga de caracteres (el JWT token)

Si ves `null`, significa que el login no guardó el token correctamente.

---

## Paso 2: Verifica el Contenido del JWT Token

En la misma consola, ejecuta:

```javascript
// Decodificar y ver el contenido del token
const token = localStorage.getItem('pms_access_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Payload:', payload);
  console.log('Role:', payload.role);
  console.log('User ID:', payload.user_id);
  console.log('Username:', payload.username);
}
```

**Resultado esperado:**
- `role` debe ser `"washer"` (no vacío, no null, no undefined)
- `user_id` debe ser un número (ej: 123)
- `username` debe existir

---

## Paso 3: Verifica el Estado de Redux

En React DevTools (extensión de Chrome):
1. Ve a la pestaña "Redux"
2. Expande `auth`
3. Verifica que:
   - `isAuthenticated: true`
   - `user.role: "washer"`
   - `user.id: [algún número]`
   - `token: [el JWT token]`

Si alguno de estos es incorrecto, el ProtectedRoute rechazará el acceso.

---

## Paso 4: Verifica que la Redirección Funciona

1. Después de hacer login, verifica que:
   - La URL cambió a `/washer/dashboard`
   - El contenido de la página es el Dashboard (no la página de login)

2. Si ves la página de login pero la URL es `/washer/dashboard`, entonces hay un problema con ProtectedRoute

---

## Problemas Comunes y Soluciones

### Problema: "Me saca inmediatamente al login"
**Causa más común:** El `role` en el token no está presente o es inválido

**Solución:**
1. Verifica que el backend está devolviendo `role` en el TokenResponse
2. El payload del JWT debe incluir: `role`, `user_id`, `username`
3. Si falta alguno, el login fallará

### Problema: "Token no se guarda en localStorage"
**Causa:** El login no está respondiendo correctamente

**Solución:**
1. Abre DevTools → Network
2. Haz login
3. Ve a la solicitud POST a `/api/v1/auth/login`
4. Verifica que la respuesta incluye `access_token`
5. Si no incluye `access_token`, el backend tiene un problema

### Problema: "Redux state dice que estoy autenticado pero sigo en login"
**Causa:** ProtectedRoute no ve el usuario en Redux

**Solución:**
1. Verifica que Redux DevTools muestra `user.role = "washer"` (no null)
2. Si user es null pero isAuthenticated es true, hay un bug en la sincronización
3. Recarga la página y vuelve a intentar login

---

## Debugging Automático

Hemos agregado una función de debugging que puedes usar:

```javascript
// En la consola del navegador
window.__debugAuth()
```

Esta función:
- ✓ Verifica si el token existe
- ✓ Decodifica el JWT y muestra el payload
- ✓ Sugiere qué verificar en Redux DevTools
- ✓ Te dice si deberías poder acceder al dashboard

---

## Checklist de Verificación Rápida

- [ ] `localStorage.getItem('pms_access_token')` devuelve un token válido
- [ ] El JWT token tiene 3 partes separadas por puntos (.)
- [ ] Decoded payload incluye: `role`, `user_id`, `username`
- [ ] Redux auth state: `isAuthenticated = true`, `user.role = "washer"`
- [ ] Después del login, la URL cambia a `/washer/dashboard`
- [ ] Después del login, ves el Dashboard (no la página de login)
- [ ] Si recargas la página, sigues autenticado (no vuelves al login)

Si todas las casillas están marcadas, ¡la autenticación está funcionando correctamente!

---

## Contacto para Soporte

Si después de seguir estos pasos aún tienes problemas:

1. Proporciona la salida de `window.__debugAuth()` en la consola
2. Proporciona el payload del JWT (decodificado)
3. Proporciona un screenshot del Redux DevTools mostrando el auth state
4. Proporciona el error exacto que ves en la consola del navegador
