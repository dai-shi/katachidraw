import * as ExpoFileSystem from "expo-file-system";

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
    await ExpoFileSystem.writeAsStringAsync(`file://${fileName}`, content);
  },
};
