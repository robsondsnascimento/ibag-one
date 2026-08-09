export function validateEnvironment(environment: Record<string, unknown>) {
  const nodeEnv = environment.NODE_ENV ?? 'development';
  const port = Number(environment.PORT ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535');
  }

  const jwtSecret = environment.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET deve possuir ao menos 32 caracteres');
  }

  if (nodeEnv === 'production' && !environment.CORS_ORIGINS) {
    throw new Error('CORS_ORIGINS é obrigatório em produção');
  }

  return { ...environment, NODE_ENV: nodeEnv, PORT: port };
}
