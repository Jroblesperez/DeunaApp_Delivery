# Preparación de conexión Atlassian
La arquitectura define OAuth 2.0 3LO, selección de Cloud Site, scopes, refresh/revocation, health y permisos. Los secretos se resuelven mediante `vaultReference`; nunca llegan al frontend. Jira se consume solo desde backend, con paginación, timeout, cancelación, respuestas parciales y modo read-only. No existe conexión real en este incremento.
