# commits

## Autor
awnt9.

## Resumen
Propone agrupaciones de commits a partir del diff sin modificar el repositorio. La versión `v2` siempre devuelve los mensajes de commit en inglés.

## Cuándo usarla
Cuando quieras convertir cambios locales en commits pequeños y coherentes.

## Cuándo no usarla
Cuando necesites que el agente haga staging, cree commits o edite archivos.

## Requisitos previos
Un repositorio Git con cambios locales o staged para analizar.

## Cómo usar
Escribe <code>&#47;commits</code> en el chat. Instala `v2` si quieres mensajes de commit siempre en inglés:

```bash
npm run install -- --skill commits --version v2
```
