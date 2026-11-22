# Manual de implementación de la bitácora

> Cómo dejar registrada cada petición —con su fecha, su hora y su texto exacto—
> en **cualquier** asistente de código, sin depender de que nadie se acuerde de
> activarlo.

**Versión:** 1.1 · 30 de julio de 2026
**Fuente única de las reglas:** `~/.claude/reglas/REGLAS.md`

---

## 0. Qué es esto y por qué existe

Una sesión de trabajo con un agente se pierde. El chat se cierra, el contexto se
resume, la ventana se corta a la mitad de una tarea. Tres semanas después nadie
recuerda si aquello se pidió con una condición o sin ella.

La bitácora resuelve exactamente eso: **guarda lo que se pidió, palabra por
palabra, con la hora**. No guarda lo que el agente respondió —eso ya está en el
código y en los commits—, sino **el encargo**, que es lo que desaparece.

Sirve para tres cosas concretas:

1. **Reconstruir el hilo** cuando una sesión se corta a mitad de un trabajo.
2. **Resolver discrepancias** sobre qué se pidió, sin depender de la memoria.
3. **Ver el patrón**: releer un mes de bitácora enseña en qué se va el tiempo.

### Qué NO es

- **No es un registro de auditoría con garantías.** Es un archivo de texto en el
  equipo; quien tenga acceso puede editarlo. Si hace falta trazabilidad
  irrefutable, esto no vale.
- **No captura las respuestas del agente.** Deliberado: multiplicaría el tamaño
  por veinte y esa información ya está en el repositorio.
- **No sale del equipo.** Va al `.gitignore`. Lo que uno escribe mientras
  trabaja no es contenido del proyecto.

---

## 1. Decisiones de diseño (y por qué)

Estas cuatro decisiones están tomadas y conviene entenderlas antes de tocar
nada, porque explican por qué el código es como es.

### 1.1 Se crea sola, no se activa a mano

La versión original de este hook era **opt-in**: solo escribía si existía una
carpeta `bitacora/` creada previamente. El resultado previsible es que **nunca
se activa**: hay que acordarse justo el día que se empieza un proyecto, que es
el día en que uno está pensando en otra cosa.

Aquí se crea sola en la primera petición.

### 1.2 Pero solo dentro de algo que parezca un proyecto

Como contrapartida de lo anterior: si se creara siempre, abrir el agente en el
Escritorio o en Descargas dejaría carpetas `bitacora/` sueltas por todas partes.

Se comprueba que exista al menos uno de estos marcadores:
`.git`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `.claude`.

### 1.3 Nunca bloquea el turno

Ante **cualquier** error —permisos, disco lleno, JSON mal formado— el hook sale
con código 0 y en silencio.

El motivo: perder una anotación es una molestia; impedir que alguien trabaje
porque el sistema de registro falló es inaceptable. El registro está al servicio
del trabajo, no al revés.

### 1.4 Nunca escribe en stdout

En Claude Code y en Gemini CLI, lo que un hook de tipo *prompt* escribe en
stdout **se inyecta como contexto del modelo**. Un hook que imprima «anotado» le
está metiendo esa palabra al modelo en cada turno.

Todo lo que haya que decir va a stderr o a ningún sitio.

### 1.5 Rota antes de escribir, no después

Al superar los 100 KB, el archivo se archiva con su fecha y empieza uno nuevo.
La rotación ocurre **antes** de anotar la petición nueva: si fuera después, el
archivo archivado podría cortar por la mitad el turno recién escrito.

---

## 2. El script

Es el mismo para todas las herramientas. Está en `~/.claude/hooks/bitacora.py`.

Lee un JSON por stdin, saca de él `cwd` y `prompt`, y anota. Las herramientas
usan nombres distintos para esos dos campos, así que el script acepta varios
alias — así **un solo archivo sirve para todas** y no hay cinco versiones que
mantener sincronizadas.

```python
#!/usr/bin/env python3
import json, os, sys
from datetime import datetime
from pathlib import Path

UMBRAL_BYTES = 100 * 1024
MARCADORES = ('.git', 'package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', '.claude')

# Cada herramienta llama distinto a lo mismo. Aceptar alias es lo que permite
# que este script único valga para todas.
CLAVES_PROMPT = ('prompt', 'user_message', 'message', 'text', 'input')
CLAVES_RUTA   = ('cwd', 'workspace_root', 'project_root', 'directory', 'workspacePath')

def primero(data, claves):
    for k in claves:
        v = data.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return None

def main() -> int:
    try:
        # BYTES y decodificación UTF-8 explícita: en Windows sys.stdin usa la
        # codificación local (cp1252) y corrompería los acentos.
        data = json.loads(sys.stdin.buffer.read().decode('utf-8'))
    except Exception:
        return 0
    try:
        raiz = Path(primero(data, CLAVES_RUTA) or os.getcwd())
        if not any((raiz / m).exists() for m in MARCADORES):
            return 0
        peticion = primero(data, CLAVES_PROMPT)
        if not peticion:
            return 0

        carpeta = raiz / 'bitacora'
        carpeta.mkdir(exist_ok=True)
        actual = carpeta / 'bitacora-actual.md'

        if actual.exists() and actual.stat().st_size > UMBRAL_BYTES:
            sello = datetime.now().strftime('%Y-%m-%d-%H%M%S')
            actual.rename(carpeta / f'bitacora-{sello}.md')

        if not actual.exists():
            actual.write_text(
                '# Bitacora del proyecto\n\n'
                'Registro automatico de lo que se ha pedido, con su fecha y hora.\n'
                'Se rota sola al superar los 100 KB.\n\n',
                encoding='utf-8')

        with actual.open('a', encoding='utf-8') as f:
            f.write(f"\n## {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n{peticion}\n")
    except Exception:
        return 0
    return 0

if __name__ == '__main__':
    sys.exit(main())
```

### Requisito

Python 3.8 o superior en el PATH. Comprobar con:

```bash
python --version      # Windows
python3 --version     # macOS y Linux
```

En los ejemplos siguientes, **en Windows se usa `python`** y en macOS/Linux
`python3`. Ajustar según el sistema.

---

## 3. Instalación por herramienta

Estado de cada una, sin adornos:

| Herramienta | Mecanismo | Evento | Estado |
|---|---|---|---|
| **Claude Code** | hooks nativos | `UserPromptSubmit` | ✅ **Probado en este equipo** |
| **opencode** | plugin JS | `message.updated` | ✅ **Probado en este equipo** (7/7) |
| **Kimi Code CLI** | `~/.kimi-code/config.toml` | `UserPromptSubmit` | ✅ **Instalado y validado** |
| **Cursor** | `hooks.json` | `beforeSubmitPrompt` | 📖 Según su documentación |
| **Gemini CLI** | `settings.json` | `BeforeAgent` | 📖 Según su documentación |
| **Codex CLI** | `config.toml` | `UserPromptSubmit` | 📖 Documentado · **no en Windows** |
| **VS Code + Copilot** | — | — | ❌ **No hay evento de prompt** |
| **Windsurf, Antigravity** | — | — | ❌ Sin hooks documentados |

**Lo marcado 📖 no se ha ejecutado en este equipo** porque esas herramientas no
están instaladas aquí. Las rutas y formatos salen de su documentación oficial,
consultada el 30 de julio de 2026. La sección 5 explica cómo comprobar cada una
en dos minutos.

**Sobre Kimi:** el CLI se instaló (v0.31.0), su propio `kimi doctor` valida la
configuración y el script se probó con el JSON exacto que envía. Lo único que no
se ha podido comprobar es el disparo real, porque `kimi -p` exige iniciar sesión
con la cuenta del usuario y falla **antes** de llegar al hook.

---

### 3.1 Claude Code ✅

**Archivo:** `~/.claude/settings.json`

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python \"C:/Users/TU_USUARIO/.claude/hooks/bitacora.py\""
          }
        ]
      }
    ]
  }
}
```

Detalles que importan:

- La estructura lleva **dos niveles de `hooks`**: el array del evento contiene
  objetos que a su vez tienen su propio array `hooks`. Es fácil equivocarse y
  poner el comando un nivel arriba; entonces no se dispara y no avisa.
- **Ruta absoluta y con barras normales** (`/`), incluso en Windows. Con barras
  invertidas hay que escaparlas en JSON (`\\`) y es una fuente de errores.
- Claude Code envía `cwd` y `prompt`, que son los nombres que el script busca
  primero.

**Comprobar que quedó bien:**

```bash
node -e "const c=JSON.parse(require('fs').readFileSync(process.env.USERPROFILE+'/.claude/settings.json','utf8')); console.log(JSON.stringify(c.hooks,null,2))"
```

---

### 3.2 Cursor 📖

**Archivos:** `~/.cursor/hooks.json` (global) o `<proyecto>/.cursor/hooks.json`

```json
{
  "version": 1,
  "hooks": {
    "beforeSubmitPrompt": [
      {
        "command": "python \"C:/Users/TU_USUARIO/.claude/hooks/bitacora.py\"",
        "timeout": 10
      }
    ]
  }
}
```

Diferencias con Claude Code, y son importantes:

- **Estructura plana**: el comando va directo en el objeto, sin el segundo array
  `hooks` anidado. Copiar la forma de Claude Code aquí no funciona.
- **`"version": 1` es obligatorio.**
- **Cursor espera JSON por stdout.** Nuestro script no escribe nada, y en Cursor
  eso puede producir un error de análisis. Si aparece «Unexpected token» en el
  canal de salida, hace falta un envoltorio que imprima `{}`:

```bash
#!/bin/bash
# ~/.cursor/hooks/bitacora.sh
cat | python "$HOME/.claude/hooks/bitacora.py"
echo '{}'          # Cursor exige JSON válido por stdout
exit 0
```

- Los hooks de proyecto se ejecutan **desde la raíz del proyecto**: las rutas
  relativas se escriben `.cursor/hooks/script.sh`, no `./hooks/script.sh`.
- Para depurar: panel de salida → canal **«Hooks»**.

---

### 3.3 Gemini CLI 📖

**Archivo:** `~/.gemini/settings.json` (global) o `.gemini/settings.json`

⚠️ **No existe `UserPromptSubmit` en Gemini CLI.** El evento equivalente se
llama **`BeforeAgent`**. Usar el nombre de Claude Code aquí no da error: no
dispara nada, que es peor porque parece funcionar.

```json
{
  "hooks": {
    "BeforeAgent": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python \"C:/Users/TU_USUARIO/.claude/hooks/bitacora.py\"",
            "name": "bitacora",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

- La estructura **sí lleva el doble anidamiento**, como Claude Code.
- El `timeout` va en **milisegundos**, no en segundos como en Cursor.
- Envía `cwd` y `prompt`: nuestro script los reconoce sin cambios.

---

### 3.4 Codex CLI 📖 — con dos avisos serios

**Archivo:** `~/.codex/config.toml`

```toml
[features]
codex_hooks = true          # obligatorio: la función viene desactivada

[[hooks.UserPromptSubmit]]
command = ["python", "C:/Users/TU_USUARIO/.claude/hooks/bitacora.py"]
timeout_ms = 10000
```

⚠️ **Dos limitaciones que hay que conocer antes de intentarlo:**

1. **No está disponible en Windows.** La función es experimental y, según su
   documentación, no funciona en Windows. En este equipo, por tanto, esta
   sección no es aplicable hoy.
2. **Requiere Codex v0.114 o superior** (marzo de 2026) y activar el interruptor
   `codex_hooks`, que viene apagado.

Nota aparte: la clave `notify` **se ignora** en el `config.toml` del proyecto y
solo funciona en el de usuario. Además solo se dispara al terminar un turno, no
al enviarlo, así que no sirve para esto.

---

### 3.5 opencode ✅

opencode no usa archivos de configuración para esto: usa **plugins en
JavaScript**.

**Archivo:** `~/.config/opencode/plugins/bitacora.js` (global) o
`<proyecto>/.opencode/plugins/bitacora.js`

```javascript
/**
 * Bitácora para opencode.
 *
 * Aquí no se invoca el script de Python: opencode entrega el mensaje ya
 * estructurado, así que llamar a un proceso externo por cada tecleo sería
 * gasto sin ganancia. Se escribe el mismo formato de archivo, que es lo que
 * de verdad importa para que la bitácora sea única.
 */
import { appendFileSync, existsSync, mkdirSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const UMBRAL = 100 * 1024

export const Bitacora = async ({ directory }) => ({
  'message.updated': async ({ message }) => {
    // Solo las peticiones del usuario: las respuestas ya están en el código.
    if (!message || message.role !== 'user') return
    const texto = (message.content ?? '').toString().trim()
    if (!texto) return

    try {
      const carpeta = join(directory, 'bitacora')
      mkdirSync(carpeta, { recursive: true })
      const actual = join(carpeta, 'bitacora-actual.md')

      if (existsSync(actual) && statSync(actual).size > UMBRAL) {
        const sello = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        renameSync(actual, join(carpeta, `bitacora-${sello}.md`))
      }
      if (!existsSync(actual)) {
        writeFileSync(actual, '# Bitacora del proyecto\n\n', 'utf8')
      }
      const ahora = new Date().toLocaleString('sv').slice(0, 19)   // AAAA-MM-DD HH:MM:SS
      appendFileSync(actual, `\n## ${ahora}\n\n${texto}\n`, 'utf8')
    } catch {
      // Silencio deliberado: no puede costarle el turno al usuario.
    }
  },
})
```

⚠️ `message.updated` **se dispara más de una vez** por mensaje mientras se va
construyendo. El plugin instalado ya guarda el último texto anotado y omite la
repetición; sin esa guarda, cada petición aparecería duplicada.

**Probado en este equipo** (7 de 7): anota la petición, no la duplica, ignora
las respuestas del agente, entiende el formato `parts`, no escribe fuera de un
proyecto, conserva los acentos y pone la marca de tiempo.

El plugin instalado está en `~/.config/opencode/plugin/bitacora.js`. Ojo: la
carpeta es **`plugin`** en singular.

---

### 3.6 Kimi Code CLI ✅

**Archivo:** `~/.kimi-code/config.toml`

🔴 **CUIDADO CON LA DOCUMENTACIÓN ANTIGUA.** Hay dos proyectos distintos de
Moonshot y su configuración **no es compatible**:

| | `kimi-cli` (antiguo, Python) | `kimi-code` (actual, v0.31) |
|---|---|---|
| Configuración | `~/.config/kimi/hooks/*.HOOK.md` | `~/.kimi-code/config.toml` |
| Formato | markdown con frontmatter YAML | TOML, array `[[hooks]]` |
| Evento del prompt | `pre-agent-turn` | **`UserPromptSubmit`** |

Buscando «kimi hooks» aparece primero la especificación del proyecto antiguo.
Aplicarla al actual no da error: simplemente no se dispara nunca.

```toml
[[hooks]]
event = "UserPromptSubmit"
matcher = ".*"
command = "python \"C:/Users/TU_USUARIO/.claude/hooks/bitacora.py\""
timeout = 10
```

**El campo del texto se llama `matcher_text`**, no `prompt`. El JSON que llega
por stdin es:

```json
{
  "hook_event_name": "UserPromptSubmit",
  "session_id": "session_abc",
  "cwd": "/ruta/al/proyecto",
  "matcher_text": "lo que escribió el usuario"
}
```

⚠️ **Este evento es BLOQUEANTE y lo que el hook imprima en stdout SE AÑADE AL
CONTEXTO del modelo.** Un hook que imprima «anotado» estaría metiendo esa
palabra en la conversación en cada turno. Por eso el script no escribe nada.
Códigos de salida: **0 permitir**, **2 bloquear** (con el motivo en stderr),
cualquier otro permite igualmente (falla abierto).

**Validar la configuración** — Kimi trae su propio comprobador, y conviene
usarlo antes de dar nada por bueno:

```bash
kimi doctor
# OK config.toml  C:/Users/…/.kimi-code/config.toml
```

**Kimi lee `AGENTS.md`**, no `CLAUDE.md`: el sincronizador ya se lo deja puesto.

**Estado:** instalado (v0.31.0), configuración validada por `kimi doctor`, y el
script probado con el JSON exacto que Kimi envía —incluidos los acentos y la
comprobación de que stdout queda vacío—. El disparo real no se ha podido
verificar porque `kimi -p` exige iniciar sesión y falla antes de llegar al hook.

---

### 3.7 VS Code con Copilot ❌

**No se puede hacer automáticamente.** VS Code no expone ningún evento que se
dispare cuando el usuario envía un mensaje a Copilot Chat; las tareas
(`tasks.json`) responden a acciones del editor, no del chat.

Decirlo claro evita que alguien pierda una tarde buscándolo.

**Lo que sí se puede:** un comando manual. En `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Anotar en la bitácora",
      "type": "shell",
      "command": "python",
      "args": ["${userHome}/.claude/hooks/bitacora.py"],
      "problemMatcher": []
    }
  ]
}
```

Se ejecuta con `Ctrl+Shift+P` → «Run Task». Requiere pasarle el JSON por stdin,
así que en la práctica es más cómodo escribir en el archivo directamente.

### 3.8 Windsurf y Antigravity ❌

A 30 de julio de 2026 no tienen un sistema de hooks documentado equivalente. Lo
que sí leen es el archivo de reglas (`.windsurfrules`, `AGENTS.md`), que el
sincronizador ya genera.

---

## 4. Instalación automática al abrir un proyecto

En Claude Code hay un segundo hook, `SessionStart`, que sincroniza las reglas en
todas las herramientas al abrir cualquier proyecto:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python \"C:/Users/TU_USUARIO/.claude/hooks/iniciar-proyecto.py\""
          }
        ]
      }
    ]
  }
}
```

**Por qué un hook y no un paso manual:** sincronizar a mano se hace las dos
primeras veces y luego se olvida. Cuando se olvida, cada herramienta trabaja con
una versión distinta de las reglas y nadie entiende por qué un agente respeta
una norma y otro no.

---

## 5. Comprobar que funciona

### 5.1 Prueba directa del script

Sin depender de ninguna herramienta:

```bash
cd /ruta/a/un/proyecto
echo '{"cwd":"/ruta/a/un/proyecto","prompt":"prueba con acentos: ñ á é"}' | python ~/.claude/hooks/bitacora.py
echo "salida: $?"          # tiene que ser 0
cat bitacora/bitacora-actual.md | tail -5
```

Debe verse la petición con su fecha **y los acentos correctos**. Si salen
caracteres raros, el problema es la codificación de stdin (ver §1.4 del script:
se lee como bytes a propósito).

### 5.2 Prueba negativa — la que de verdad importa

Un registro que escribe donde no debe es peor que no tenerlo:

```bash
mkdir -p /tmp/no-es-proyecto && cd /tmp/no-es-proyecto
echo '{"cwd":"/tmp/no-es-proyecto","prompt":"esto NO debe anotarse"}' | python ~/.claude/hooks/bitacora.py
ls bitacora 2>/dev/null && echo "🔴 FALLO: escribió fuera de un proyecto" || echo "✓ correcto"
```

### 5.3 Prueba en la herramienta real

Enviar un mensaje cualquiera y mirar si aparece:

```bash
tail -5 bitacora/bitacora-actual.md
```

Si no aparece, en este orden:

1. ¿El hook está registrado? Leer el archivo de configuración y comprobar la
   **estructura exacta** (Claude Code y Gemini anidan; Cursor no).
2. ¿El nombre del evento es el de ESA herramienta? (`beforeSubmitPrompt` en
   Cursor, `BeforeAgent` en Gemini, `UserPromptSubmit` en Claude y Codex).
3. ¿La ruta al script es absoluta y existe?
4. ¿`python` está en el PATH de la herramienta? Un IDE puede tener un PATH
   distinto al de la terminal. Probar con la ruta completa al intérprete.
5. ¿Hay panel de depuración? Cursor tiene canal «Hooks».

---

## 6. Mantenimiento

**El archivo se ignora en git.** Añadir a `.gitignore`:

```gitignore
# Bitácora: registro local de lo pedido en este equipo, no contenido del
# proyecto. Versionarla llenaría el historial de ruido.
bitacora/
```

**Rotación.** Automática a los 100 KB (unas 1.500 peticiones). Los archivos
rotados se llaman `bitacora-AAAA-MM-DD-HHMMSS.md` y no se borran solos: si
molestan, se borran a mano.

**Buscar en el historial:**

```bash
grep -rn "palabra que recuerdo" bitacora/
```

---

## 7. Preguntas que surgen

**¿Y si trabajo con dos herramientas a la vez?**
Escriben en el mismo archivo, cada una con su marca de tiempo. Es lo deseable:
una sola bitácora por proyecto, sin importar con qué se trabajó.

**¿Puede duplicar entradas?**
En Claude Code, Cursor, Gemini y Codex no: el evento se dispara una vez por
envío. En opencode sí es posible (§3.5).

**¿Ralentiza algo?**
Es una escritura de unos cientos de bytes: milisegundos. Los hooks de tipo
prompt son síncronos, así que un script lento sí se notaría — por eso este no
hace nada más que escribir.

**¿Y si quiero guardar también las respuestas?**
Se puede, con el evento de fin de turno (`Stop` en Claude y Codex, `AfterAgent`
en Gemini), pero multiplica el tamaño por veinte y esa información ya está en el
código y en los commits. Por eso no se hace.

---

## 8. Archivos que componen el sistema

```
~/.config/opencode/plugin/bitacora.js    Plugin de opencode (probado)
~/.kimi-code/config.toml                 Hook de Kimi Code (validado)
~/.gemini/GEMINI.md                      Reglas globales de Gemini

~/.claude/
├── hooks/
│   ├── bitacora.py              El registro. Uno solo para todas.
│   └── iniciar-proyecto.py      Sincroniza reglas al abrir un proyecto.
├── reglas/
│   ├── REGLAS.md                FUENTE ÚNICA de las normas de trabajo.
│   ├── sincronizar.mjs          Genera las copias por herramienta.
│   └── Manual de implementacion de bitacora.md
├── skills/
│   └── bitacora/SKILL.md        Instala todo esto en una orden.
├── CLAUDE.md                    Generado desde REGLAS.md.
└── settings.json                Registro de los dos hooks.
```

Y en cada proyecto, generados por el sincronizador:

```
<proyecto>/
├── AGENTS.md                        Codex, opencode, Cursor, Jules
├── .cursorrules                     Cursor (formato antiguo)
├── .github/copilot-instructions.md  GitHub Copilot
├── GEMINI.md                        Gemini CLI
├── .windsurfrules                   Windsurf
└── bitacora/                        (ignorada en git)
```

---

## 9. Fuentes

Documentación consultada el 30 de julio de 2026:

- [Cursor — Hooks](https://cursor.com/docs/agent/hooks)
- [Gemini CLI — Referencia de hooks](https://geminicli.com/docs/hooks/reference/)
- [Codex — Hooks](https://developers.openai.com/codex/hooks)
- [opencode — Plugins](https://opencode.ai/docs/plugins/)

Claude Code es la única probada en este equipo; el resto proviene de esas
fuentes y está marcado como tal en la tabla de la sección 3.
