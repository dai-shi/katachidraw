import { fileSave } from "browser-fs-access";

import { FileSystemModule } from "./FileSystemModule";

export const FileSystem: FileSystemModule = {
  saveFileAsString: async (
    fileName: string,
    content: string,
    options: {
      mimeType: string;
      extension: string;
    }
  ) => {
    await fileSave(new Blob([content], { type: options.mimeType }), {
      fileName,
      extensions: [options.extension],
    });
  },
};
