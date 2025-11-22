# Sistema de Temas (Theme System)

## 📋 Descripción

El sistema de temas permite a los usuarios cambiar entre modo claro y oscuro en toda la aplicación. El tema seleccionado se guarda en `localStorage` y se aplica automáticamente en futuras visitas.

## 🎨 Características

- ✅ **Modo claro y oscuro** con transiciones suaves
- ✅ **Persistencia** en localStorage
- ✅ **Detección automática** de preferencia del sistema
- ✅ **Botón toggle animado** con iconos de sol/luna
- ✅ **Soporte completo** en todos los layouts

## 🚀 Uso

### Hook `useTheme`

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={toggleTheme}>Cambiar tema</button>
      <button onClick={() => setTheme('dark')}>Modo oscuro</button>
      <button onClick={() => setTheme('light')}>Modo claro</button>
    </div>
  );
}
```

### Componente `ThemeToggle`

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

function MyLayout() {
  return (
    <div>
      <ThemeToggle />
    </div>
  );
}
```

## 🎨 Clases de Tailwind

Usa el prefijo `dark:` para estilos específicos del modo oscuro:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Este div cambia de color según el tema
</div>
```

## 📁 Archivos

- `src/hooks/useTheme.ts` - Hook personalizado para manejar el tema
- `src/components/ThemeToggle.tsx` - Componente de botón toggle
- `src/index.css` - Estilos base con soporte para dark mode
- `tailwind.config.js` - Configuración de Tailwind con `darkMode: 'class'`

## 🔧 Configuración

El sistema usa la estrategia `class` de Tailwind, lo que significa que el modo oscuro se activa añadiendo la clase `dark` al elemento `<html>`.

```js
// tailwind.config.js
export default {
  darkMode: 'class', // Habilita dark mode basado en clase
  // ...
}
```

## 🎯 Layouts con ThemeToggle

El botón de cambio de tema está disponible en:

- ✅ `AdminLayout` - En el header del sidebar
- ✅ `OperationalLayout` - En el header del sidebar
- ✅ `WasherLayout` - En el header del sidebar
- ✅ `AuthLayout` - En la esquina superior derecha

## 💡 Consejos

1. **Siempre usa clases dark:** para elementos que deben cambiar en modo oscuro
2. **Prueba ambos temas** durante el desarrollo
3. **Usa colores semánticos** de la paleta personalizada (primary, secondary, etc.)
4. **Transiciones suaves** con `transition-colors duration-300`
