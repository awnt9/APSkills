---
name: prepare-skill
description: Normaliza borradores de Agent Skills dentro del repositorio AP-Skills para que pasen validacion. Use when a contributor has added a skill as a .txt/.md file, put SKILL.md in the wrong place, omitted README.md, omitted version folders, or missed required SKILL.md frontmatter.
---

# prepare-skill

Ayuda a convertir una skill en cualquier estado intermedio en una skill valida para este repositorio.

## Objetivo

Encajar borradores de skills dentro de la estructura esperada:

```txt
skills/<skill-name>/
├── README.md
└── v1/
    └── SKILL.md
```

La prioridad es hacer que la skill pase `npm run validate` sin reescribir el contenido funcional que aporto el usuario.

## Reglas de preservacion

- No cambies el cuerpo de la skill creada por el usuario.
- Solo puedes modificar el contenido de la skill para anadir o corregir la cabecera YAML de `SKILL.md`.
- Si el archivo ya tiene cuerpo util, conservalo en el mismo orden y con el mismo texto.
- Si el archivo tiene una cabecera incompleta o incorrecta, reemplaza solo esa cabecera por una valida y deja el cuerpo intacto.
- No cambies instrucciones internas, ejemplos, comandos, listas, nombres de herramientas ni redaccion del cuerpo de la skill.
- No hagas staging, commits ni pushes salvo que el usuario lo pida explicitamente.
- No borres archivos que no hayas identificado claramente como el borrador movido a la estructura final.

## Flujo

### 1. Inspeccionar el estado

Empieza con comandos de solo lectura:

```bash
git status --short
git diff --name-status
git diff --staged --name-status
git ls-files --others --exclude-standard
find skills -maxdepth 3 -type f | sort
```

Lee los archivos candidatos con `sed` o una herramienta equivalente.

### 2. Detectar candidatos de skill

Considera como candidatos:

- Archivos `.txt` o `.md` nuevos que contengan instrucciones de una skill.
- Archivos llamados `SKILL.md` fuera de `skills/<skill-name>/<version>/`.
- Carpetas dentro de `skills/` sin `README.md`.
- Carpetas dentro de `skills/` sin una carpeta de version como `v1`.
- Carpetas con `skills/<skill-name>/SKILL.md` en la raiz.
- Skills cuyo `SKILL.md` no tenga cabecera YAML valida.
- Skills cuyo `README.md` falte o no tenga las secciones obligatorias.

Si hay varios candidatos independientes y no esta claro si pertenecen a la misma skill, pregunta antes de mezclarlos.

### 3. Elegir nombre y destino

Elige el nombre de la skill en este orden:

1. El nombre de la carpeta si el archivo ya esta dentro de `skills/<skill-name>/`.
2. El campo `name:` si existe una cabecera YAML clara.
3. El nombre del archivo, normalizado a minusculas con guiones.
4. Una propuesta breve basada en el contenido, solo si las opciones anteriores no existen.

El nombre debe usar solo letras minusculas, numeros y guiones.

Usa este destino por defecto para skills nuevas:

```txt
skills/<skill-name>/v1/SKILL.md
```

Si el usuario ya creo una carpeta de version valida, conserva esa version.

### 4. Mover o crear la estructura

Antes de editar, explica brevemente que vas a mover o crear.

Haz los cambios necesarios:

- Crea `skills/<skill-name>/` si no existe.
- Crea `skills/<skill-name>/v1/` si no hay version valida.
- Si el borrador esta en `.txt`, conviertelo a `SKILL.md` al moverlo al destino.
- Si el borrador esta como `.md` con otro nombre, muevelo o copia su contenido a `SKILL.md` segun el contexto.
- Si existe `skills/<skill-name>/SKILL.md`, muevelo a `skills/<skill-name>/v1/SKILL.md`.
- No sobrescribas un `SKILL.md` existente con contenido distinto sin pedir confirmacion.

### 5. Arreglar cabecera de SKILL.md

El archivo final debe empezar exactamente con:

```md
---
name: <skill-name>
description: <descripcion de una linea>
---
```

Para generar la `description`, resume lo que la skill hace y cuando debe usarse basandote solo en el contenido visible del archivo.

Reglas:

- Mantener `name:` igual al nombre de carpeta elegido.
- Mantener `description:` en una sola linea.
- No anadir campos extra a la cabecera.
- Si falta cabecera, insertarla encima del cuerpo existente.
- Si la cabecera existe pero es invalida, corregirla y conservar el cuerpo.

### 6. Crear o completar README.md

Cada skill debe tener:

```txt
skills/<skill-name>/README.md
```

El README debe incluir estos encabezados:

```md
## Autor
## Resumen
## Cuándo usarla
## Cuándo no usarla
## Requisitos previos
## Cómo usar
```

Si falta el README, crealo con texto breve inferido de la skill.

Si existe, conserva su contenido y anade las secciones que falten. Si una seccion obligatoria esta vacia, rellena una linea breve.

Usa `Pendiente de definir.` para `Autor` cuando no haya un autor claro.

### 7. Validar y corregir

Ejecuta:

```bash
npm run validate
```

Si falla, corrige solo lo necesario para pasar la validacion:

- Nombres de carpeta.
- Ubicacion `skills/<skill-name>/<version>/SKILL.md`.
- Cabecera YAML.
- README faltante o secciones requeridas.

Vuelve a ejecutar `npm run validate` hasta que pase o hasta encontrar un bloqueo real.

## Salida esperada

Al terminar, informa:

- Ruta final de `SKILL.md`.
- Ruta final de `README.md`.
- Si se movio o renombro algun archivo original.
- Resultado de `npm run validate`.
- Cualquier decision inferida, como nombre o descripcion.

## Casos especiales

- Si el borrador contiene varias skills en un unico archivo, pregunta antes de separarlas.
- Si el contenido no parece una skill, avisa y pide confirmacion antes de moverlo.
- Si hay una colision con una skill existente, pide confirmacion antes de sobrescribir.
- Si el usuario pide crear una version nueva, usa la version indicada en vez de `v1`.
