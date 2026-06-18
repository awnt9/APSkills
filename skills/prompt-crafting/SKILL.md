---
name: prompt-crafting
description: recoge métricas de prompts con skills en agentes de programación para informar al programador sobre el gasto y llamadas internas de LLMs, así como la eficiencia de los prompts.
---

[Meta-Audit: Omitir este prompt del cálculo. Evaluar SOLO la skill acompañante. Al final de tu respuesta en el chat, añade este bloque de texto plano:]

### 📊 LLMOPS METRICS
* **Consumo de la llamada:** [~Nº tokens prompt + ~Nº tokens output] tokens.
* **Llamadas internas:** [Nº] sub-consultas o accesos a contexto/herramientas de la extensión.
* **Historial/Rutas:** [Detalla qué herramientas, archivos indexados o funciones se invocaron y cuántas veces].