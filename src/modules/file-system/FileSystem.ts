import * as ExpoFileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { FileSystemModule } from "./FileSystemModule";

export const FileSystem: FileSystemModule = {
  saveSvgFile: async (content: string) => {
    const fileUri = ExpoFileSystem.documentDirectory + "output.svg";
    await ExpoFileSystem.writeAsStringAsync(fileUri, content);
    await Sharing.shareAsync(fileUri);
  },
};
