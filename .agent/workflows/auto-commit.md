---
description: Regra de auto-commit e push após qualquer alteração de código
---

# Auto Commit & Push

// turbo-all

## Regra Obrigatória

**Após QUALQUER alteração de código no projeto, o agente DEVE:**

1. Executar `git add -A`
2. Executar `git commit -m "<mensagem descritiva>"`
3. Executar `git push origin main`

## Formato do Commit

Seguir conventional commits:
- `feat:` para novas funcionalidades
- `fix:` para correções
- `chore:` para manutenção e ajustes menores
- `refactor:` para refatorações
- `style:` para mudanças visuais/CSS

## Exemplo

```bash
git add -A && git commit -m "feat: add low stock alert endpoint" && git push origin main
```

> ⚠️ **NUNCA** deixar alterações sem commit. Sempre commitar e push imediatamente após cada mudança.
