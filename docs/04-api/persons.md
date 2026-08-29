# Pessoas e títulos ministeriais

Todas as rotas exigem JWT e respeitam a organização do usuário autenticado.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/persons` | Lista pessoas da organização, com paginação. |
| `POST` | `/persons` | Cria uma pessoa e seus campi vinculados. |
| `GET` | `/persons/:id` | Consulta o cadastro detalhado da pessoa. |
| `PATCH` | `/persons/:id` | Atualiza os dados cadastrais e os campi vinculados. |
| `PATCH` | `/persons/:id/ministerial-titles` | Substitui os títulos ministeriais da pessoa. |
| `POST` | `/persons/:id/profile-photo` | Envia ou substitui a foto de perfil. Campo multipart: `file`. |
| `GET` | `/persons/:id/profile-photo` | Retorna a foto de perfil para uma pessoa da mesma organização. |
| `DELETE` | `/persons/:id` | Inativa a pessoa, preservando seu histórico. |

Secretaria, administração e super administração gerenciam o cadastro e os títulos ministeriais.

## Foto de perfil

A foto é opcional e fica armazenada localmente no ambiente de desenvolvimento, fora do banco de dados. A API aceita somente JPG, PNG ou WEBP com até 3 MB. A própria pessoa autenticada pode enviar ou substituir sua foto; secretaria, administração e super administração podem fazê-lo para qualquer pessoa da mesma organização. A leitura também exige JWT e nunca atravessa o isolamento por organização.

Quando uma pessoa ainda não possui login, a consulta administrativa de acesso pode não ter conteúdo; o cliente trata essa resposta como ausência de acesso, sem apresentar erro de JSON no cadastro.

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
