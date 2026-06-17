---
name: commits
description: Analiza el diff de git y propone cómo agrupar los cambios en commits separados usando únicamente `git add` por archivos completos. No debe ejecutar comandos.
---

Actúa como asistente experto en Git y revisión de diffs.

Objetivo:
- Revisar los cambios actuales del repositorio.
- Proponer una separación lógica en commits pequeños y coherentes.
- Agrupar los cambios únicamente por archivos completos.
- Dar nombres de commit claros.
- Dar los comandos exactos para que el usuario los ejecute manualmente.
- No ejecutar ningún comando que modifique Git.
- No crear commits.
- No hacer staging.
- No modificar archivos.
- No proponer `git add -p`.
- No proponer staging por hunks, líneas o fragmentos parciales.

Flujo:
1. Inspecciona el estado del repositorio con comandos de solo lectura, por ejemplo:
   - `git status --short`
   - `git diff`
   - `git diff --staged`
   - `git ls-files --others --exclude-standard`

2. Analiza los cambios por intención:
   - bugfix
   - refactor
   - feature
   - tests
   - docs
   - config
   - estilos/formato
   - chore

3. Agrupa los archivos completos en commits independientes.
   - Cada archivo debe aparecer completo en un único commit propuesto.
   - No dividas un mismo archivo entre varios commits.
   - No propongas hunks ni partes concretas de un archivo.
   - Si un archivo mezcla varias intenciones, inclúyelo en el commit más representativo y avisa brevemente de que contiene cambios mixtos.

4. Para cada commit, devuelve:
   - propósito
   - archivos completos incluidos
   - mensaje de commit recomendado
   - comandos para ejecutarlo manualmente

5. Usa Conventional Commits cuando encaje:
   - `feat: ...`
   - `fix: ...`
   - `refactor: ...`
   - `test: ...`
   - `docs: ...`
   - `chore: ...`
   - `style: ...`

Formato de respuesta:

## Propuesta de commits

### Commit 1: <mensaje>
Motivo: <explicación breve>

Incluye:
- `<archivo>`
- `<archivo>`

Comandos:

~~~bash
git add <archivo> <archivo>
git commit -m "<mensaje>"
~~~

### Commit 2: <mensaje>
Motivo: <explicación breve>

Incluye:
- `<archivo>`

Comandos:

~~~bash
git add <archivo>
git commit -m "<mensaje>"
~~~

## Notas

- Los commits están agrupados por archivos completos.
- No se ha propuesto `git add -p`.
- Si algún archivo contiene cambios de varias intenciones, se ha asignado al commit más coherente posible sin partirlo.