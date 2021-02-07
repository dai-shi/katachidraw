import * as ExpoFileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { FileSystemModule } from "./FileSystemModule";

export const FileSystem: FileSystemModule = {
  saveFileAsString: async (
    fileName: string,
    content: string
    /*
    options: {
      mimeType: string;
      extension: string;
    }
    */
  ) => {
    const fileUri = ExpoFileSystem.documentDirectory + fileName;
    await ExpoFileSystem.writeAsStringAsync(fileUri, content);
    await Sharing.shareAsync(fileUri);
  },
};
