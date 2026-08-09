import 'dotenv/config';

const testDatabaseUrl = process.env.IBAG_TEST_DATABASE_URL;

if (!testDatabaseUrl || !/\/ibag_one_test(?:\?|$)/.test(testDatabaseUrl)) {
  throw new Error(
    'Os testes de integração exigem IBAG_TEST_DATABASE_URL apontando exclusivamente para o banco ibag_one_test.',
  );
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = 'ibag-one-integration-test-secret';
process.env.WHATSAPP_WEBHOOK_URL = '';
process.env.WHATSAPP_WEBHOOK_TOKEN = '';
process.env.PROPRESENTER_WEBHOOK_URL = '';
process.env.PROPRESENTER_WEBHOOK_TOKEN = '';
process.env.GOOGLE_CALENDAR_ID = '';
process.env.GOOGLE_CALENDAR_CLIENT_ID = '';
process.env.GOOGLE_CALENDAR_CLIENT_SECRET = '';
process.env.GOOGLE_CALENDAR_REFRESH_TOKEN = '';
