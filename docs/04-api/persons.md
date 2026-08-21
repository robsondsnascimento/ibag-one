# Pessoas e títulos ministeriais

Todas as rotas exigem JWT e respeitam a organização do usuário autenticado.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/persons` | Lista pessoas da organização, com paginação. |
| `POST` | `/persons` | Cria uma pessoa e seus campi vinculados. |
| `GET` | `/persons/:id` | Consulta o cadastro detalhado da pessoa. |
| `PATCH` | `/persons/:id` | Atualiza os dados cadastrais e os campi vinculados. |
| `PATCH` | `/persons/:id/ministerial-titles` | Substitui os títulos ministeriais da pessoa. |
| `DELETE` | `/persons/:id` | Inativa a pessoa, preservando seu histórico. |

Secretaria, administração e super administração gerenciam o cadastro e os títulos ministeriais.

## Títulos ministeriais

O corpo de `PATCH /persons/:id/ministerial-titles` recebe a lista completa, com no máximo oito títulos de até 80 caracteres:

```json
{
  "titulosMinisteriais": [
    "Pastor de Adoração",
    "Pastor de Campus"
  ]
}
```

Os valores são normalizados, títulos repetidos são eliminados e uma pessoa de outra organização não pode ser alterada. Títulos são descritivos: não concedem acesso ao sistema, papel `PASTOR`, papel `PASTOR_SENIOR`, campi adicionais ou gestão de Áreas de Serviço.
