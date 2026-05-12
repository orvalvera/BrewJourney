# BrewJourney

Pasaporte de cafeterías. La idea es simular un sistema de lealtad con sellos, órdenes, reseñas y personalización de bebidas, conectando una API en Node.js (Express) con un frontend estático (HTML, CSS y JavaScript sin framework) y una base JSON con lowdb.

El objetivo principal del proyecto es demostrar la implementación práctica de distintos patrones de diseño dentro de una aplicación web funcional.

## Equipo
- Karla Nava García  
- Ximena Geraldine García Pérez  
- Jesús Aaron Guillermo Escobar Pérez  
- Samuel Orval Vera Lavalle  

---

## Contenido

1. [Arquitectura](#arquitectura)  
2. [Patrones de diseño](#patrones-de-diseño)  
3. [Cómo correr el proyecto](#cómo-correr-el-proyecto)  
4. [Autenticación con JWT (demo)](#autenticación-con-jwt-demo)  
5. [Por qué armamos el proyecto así](#por-qué-armamos-el-proyecto-así)  
6. [Estructura de carpetas](#estructura-de-carpetas)  
7. [Otros comandos npm](#otros-comandos-npm)  

---

## Arquitectura

### En pocas palabras

Hay tres piezas que se entienden rápido en clase:

| Parte | Qué hace | Con qué está hecha |
|-------|----------|---------------------|
| **Interfaz** | Login, panel, pasaporte, recompensas, cafeterías, armado de bebidas, órdenes y reseñas; todo habla con la API por `fetch` | HTML, CSS, JS; el token JWT va en `localStorage` |
| **Backend** | Rutas REST, validaciones sencillas, reglas de sellos, fábrica de productos, decoradores de bebida, snapshots de reseñas | Express (módulos ES), middleware de auth |
| **Datos** | Usuarios, cafés, productos, sellos, órdenes, reseñas, historial para “deshacer” reseñas y ajustes de reglas | lowdb guardando en `data/db.json` |

Express registra **todas las rutas `/api` antes** de servir la carpeta `frontend` como archivos estáticos. Si se hiciera al revés, un `POST` a `/api/auth/login` podría acabar en un error del estilo “Cannot POST” porque el middleware de estáticos no está pensado para la API.

### Qué pasa cuando usas la app

1. El navegador pide algo a `http://localhost:3000/api/...`.  
2. Un middleware (`apiAuthGate`) revisa si la ruta va sin token o si hace falta el header `Authorization: Bearer …`.  
3. La ruta correspondiente lee o escribe datos con `database.js` y, según el caso, usa las clases de `BrewJourney/patterns/`.  
4. La respuesta es JSON; el JS del frontend actualiza variables en memoria y vuelve a pintar la página.

Esquema muy resumido:

```
Navegador  →  Express (CORS, JSON, auth, rutas /api)  →  database.js → data/db.json
                      ↘ también  BrewJourney/patterns/* cuando toca
```

---

## Patrones de diseño

Las clases viven en `BrewJourney/`; `server.js` las importa y las engancha a rutas concretas. En algunas pantallas dejamos texto que menciona la ruta (`GET /api/...`) para que, al exponer, se vea la relación entre **patrón ↔ endpoint**.

### Factory Method

Sirve para armar productos del pedido a partir de un objeto parecido para todos (`type`, `name`, `price`, etc.) y devolver el tipo correcto (bebida, snack, postre, merchandising).

- Código principal: `BrewJourney/patterns/factory/ProductFactory.js`  
- En la API: `POST /api/orders` usa la fábrica; `GET /api/products/types` lista los tipos que la fábrica conoce.

### Decorator

Sirve para ir “envolviendo” una bebida base con extras (leche alterna, shots, jarabe, crema…) y que el precio y la descripción vayan sumando capa por capa.

- Código: `BrewJourney/patterns/decorator/` (`BaseBeverage.js`, `BeverageExtras.js`, …)  
- En la API: `POST /api/beverages/customize` y `GET /api/beverages/options`.

### Strategy

Sirve para cambiar la regla de sellos (normal, doble si el monto sube, bonificación por visitas, etc.) sin llenar el controlador de `if` gigantes; el contexto delega en la estrategia que esté activa.

- Código: `BrewJourney/patterns/strategy/` (por ejemplo `StampRuleContext.js` y las reglas concretas).  
- En la API: `POST /api/stamps/rule`, `GET /api/stamps/rule/current`, y la parte de sellos que depende de la regla actual.

### Memento (historial de reseñas)

La idea es guardar copias del estado de una reseña cuando se crea o se edita, para poder ver historial y volver atrás de forma controlada. Parte de la lógica vive en helpers de base de datos (`saveReviewSnapshot`, historial en `db.json`), además de clases de estudio en `BrewJourney/patterns/memento/` y `BrewJourney/domain/`.

- Rutas útiles: `GET /api/reviews/:reviewId/history`, `POST /api/reviews/:reviewId/undo`, `PUT /api/reviews/:reviewId`.

### Demos por consola

En `BrewJourney/demo/` hay scripts que muestran algunos patrones **sin abrir el navegador**; a veces en clase o en la defensa conviene correrlos aparte para no depender del tiempo de la demo web.

---

## Cómo correr el proyecto

**Requisitos:** Node.js 18 o más reciente (cualquier LTS reciente debería bastar).

En la raíz del repo:

```bash
npm install
npm start
```

- Sitio: `http://localhost:3000`  
- API: `http://localhost:3000/api`  

Otro puerto (PowerShell):

```powershell
$env:PORT = 4000; npm start
```

En bash (Linux / macOS):

```bash
PORT=4000 npm start
```

En **PowerShell**, si encadenan comandos, suele funcionar mejor `;` que `&&`:

```powershell
Set-Location C:\ruta\BrewJourney-parcial-2; npm install; npm start
```

| Variable (opcional) | Para qué |
|---------------------|----------|
| `PORT` | Puerto del servidor (por defecto 3000). |
| `JWT_SECRET` | Firma del JWT. Si no la ponen, el código trae un valor fijo **solo para practicar en la laptop**; no es algo que se dejaría así en un sistema real. |

---

## Autenticación con JWT (demo)

No es un sistema de cuentas completo: es una **prueba corta** de cómo el cliente manda un token y el servidor lo valida en middleware.

1. En el login se elige un usuario de la lista (viene de `GET /api/users`, que es pública).  
2. La contraseña de la práctica es **`demo`**.  
3. `POST /api/auth/login` devuelve un JWT, datos del usuario y estadísticas básicas.  
4. El frontend guarda el token en `localStorage` (clave `brewjourney_jwt`) y en las demás peticiones manda `Authorization: Bearer <token>`.  
5. `GET /api/auth/me` confirma quién es el usuario del token.  
6. Si el servidor responde **401**, el cliente borra token y sesión y regresa al login (eso está centralizado en `apiFetch` en `frontend/app.js`).

Rutas que **no** piden token: `POST /api/auth/login` y `GET /api/users`. El resto de `/api/*` sí.

---

## Por qué armamos el proyecto así

- **lowdb + un JSON** — Para que cualquiera del equipo pueda clonar, correr y ver datos sin instalar MySQL ni Docker. Se pierde en escalabilidad, pero se gana en tiempo de setup y en claridad al revisar `db.json` en clase.

- **Sin React ni Vue** — Menos capas de herramientas; el foco del curso está en la API y en los patrones. La interfaz es simple a propósito y en algunos textos se nombran las rutas HTTP para enlazar con el código del servidor.

- **Carpeta `BrewJourney/` aparte de `server.js`** — Las clases de patrones quedan ordenadas para revisión y para reutilizarlas en las demos de consola. `server.js` queda como el “pegamento” HTTP.

- **Login con lista de usuarios + JWT** — Evita meter registro, correos de verificación y hash de contraseñas en un parcial donde lo que importa es mostrar middleware, payload del token y headers.

- **Rutas API antes que los estáticos** — Detalle pequeño pero importante: si no, el navegador puede recibir respuestas raras al hacer POST a la API.

---

## Estructura de carpetas

```
├── server.js              # Express: rutas y uso de patrones
├── database.js            # Lectura/escritura con lowdb
├── middleware/auth.js     # JWT y contraseña demo
├── data/db.json           # Datos (se actualiza al usar la app)
├── frontend/              # index.html, styles.css, app.js
├── BrewJourney/
│   ├── patterns/          # Factory, Decorator, Strategy, Memento
│   ├── domain/            # Modelos y variantes para ejercicios
│   └── demo/              # Demos desde terminal
├── package.json
└── README.md
```

---

## Otros comandos npm

| Comando | Qué hace |
|---------|----------|
| `npm run server` | Igual que `npm start` (levanta `server.js`). |
| `npm run demo` | Demo refactorizada en consola (`demo-refactored.js`). |
| `npm run demo:old` | Versión anterior de la demo en consola. |

---

## Licencia

Proyecto académico (ver `package.json`, licencia ISC). Uso pensado para **curso y portafolio**, no como producto terminado para producción.
