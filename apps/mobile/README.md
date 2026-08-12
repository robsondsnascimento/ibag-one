# IBAG One Mobile

Aplicativo React Native com Expo SDK 57 para Android e iPhone. A primeira versão entrega o acesso pessoal de integrantes, líderes e voluntários: início, célula, escala, agenda institucional e perfil.

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

## Anexo do estudo

Quando o estudo estiver liberado, o aplicativo apresenta o nome do anexo. No Android e iPhone, o integrante pode tocar nele para abrir o compartilhamento seguro do aparelho e salvar ou abrir o arquivo. O download utiliza o token da sessão; o anexo não fica público.

## Gerar versões para teste

O arquivo `eas.json` já possui os perfis de desenvolvimento, prévia interna e produção. Antes da primeira geração, entre na conta Expo da organização e configure o projeto:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform all --profile preview
```

A prévia interna gera um APK instalável no Android e uma distribuição interna no iPhone. Para as lojas, use o perfil `production` depois de cadastrar o app nas contas Google Play e Apple Developer.

O projeto utiliza Expo SDK 57. Para futuras atualizações, aplique uma versão por vez e execute `npx expo install --fix` e `npx expo-doctor` antes de gerar uma nova versão.

## Regras de acesso

- A pessoa vê somente as próprias células ativas.
- A agenda móvel apresenta somente eventos aprovados dos campi aos quais a pessoa está vinculada.
- As escalas permitem confirmar ou recusar apenas a própria participação.
- Gestão de cadastros, agenda e configurações permanece no painel administrativo web.
