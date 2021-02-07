import { fileSave } from "browser-fs-access";

import { FileSystemModule } from "./FileSystemModule";

export const FileSystem: FileSystemModule = {
  saveSvgFile: async (content: string) => {
    await fileSave(new Blob([content], { type: "image/svg+xml" }), {
      fileName: "output.svg",
      extensions: [".svg"],
    });
  },
};
