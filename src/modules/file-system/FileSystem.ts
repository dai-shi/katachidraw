import * as ExpoFileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";

import { FileSystemModule } from "./FileSystemModule";

export const FileSystem: FileSystemModule = {
  saveSvgFile: async (content: string) => {
    const fileUri = ExpoFileSystem.documentDirectory + "output.svg";
    await ExpoFileSystem.writeAsStringAsync(fileUri, content);
    await Sharing.shareAsync(fileUri);
  },
  loadImageFile: async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new Error("not granted");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });
    if (result.cancelled) {
      throw new Error("cancelled");
    }
    return `data:image/jpeg;base64,${result.base64}`;
  },
};
