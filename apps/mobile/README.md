# IBAG One Mobile

Aplicativo React Native com Expo para Android e iPhone. A primeira versão entrega o acesso pessoal de integrantes, líderes e voluntários: início, célula, escala, agenda institucional e perfil.

## Executar no celular

1. Mantenha a API do IBAG One em execução.
2. Copie `.env.example` para `.env` e informe a URL alcançável pela rede do celular em `EXPO_PUBLIC_API_URL`. Não use `127.0.0.1` no aparelho físico.
3. Instale as dependências e inicie o aplicativo:

   ```powershell
   npm install
   npm run start
   ```

4. Instale o Expo Go no Android ou iPhone e leia o QR Code exibido.

Para homologação externa, utilize a URL HTTPS do ambiente da API. Credenciais e senhas não são gravadas no aplicativo; somente o token da sessão, protegido pelo armazenamento seguro do sistema operacional quando a opção de manter conectado estiver ativa.

## Regras de acesso

- A pessoa vê somente as próprias células ativas.
- A agenda móvel apresenta somente eventos aprovados dos campi aos quais a pessoa está vinculada.
- As escalas permitem confirmar ou recusar apenas a própria participação.
- Gestão de cadastros, agenda e configurações permanece no painel administrativo web.
