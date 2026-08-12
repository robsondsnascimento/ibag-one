import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { currentStudyDownloadUrl } from './api';

export async function shareCurrentStudyAttachment(accessToken: string) {
  if (Platform.OS === 'web') {
    throw new Error('Abra o estudo pelo aplicativo no Android ou iPhone para salvar ou compartilhar o anexo.');
  }

  if (!await Sharing.isAvailableAsync()) {
    throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
  }

  const destination = new Directory(Paths.cache, 'ibag-one-studies');
  destination.create({ idempotent: true, intermediates: true });
  const file = await File.downloadFileAsync(
    currentStudyDownloadUrl(),
    destination,
    {
      headers: { authorization: `Bearer ${accessToken}` },
      idempotent: true,
    },
  );

  await Sharing.shareAsync(file.uri, { dialogTitle: 'Abrir estudo da célula' });
}
