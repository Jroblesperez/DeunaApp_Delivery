# Rovo readiness
Principio: **FlowOS calcula; Rovo interpreta**. Los endpoints entregan `data`, `status`, `source`, `lastUpdated`, `warnings`, `coverage`. `/advisor` simula preguntas aprobadas con reglas determinísticas, evidencia y recomendaciones. Una futura acción Rovo consumirá APIs con identidad corporativa y permisos del usuario; no recalculará métricas ni escribirá en Jira.
