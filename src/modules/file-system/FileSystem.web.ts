import { fileSave, fileOpen } from "browser-fs-access";

import { FileSystemModule } from "./FileSystemModule";

export const FileSystem: FileSystemModule = {
  saveSvgFile: async (content: string) => {
    await fileSave(new Blob([content], { type: "image/svg+xml" }), {
      fileName: "output.svg",
      extensions: [".svg"],
    });
  },
  loadImageFile: () =>
    new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = function () {
        resolve(this.result as string);
      };
      fileReader.onerror = function () {
        reject(this.error);
      };
      fileOpen({
        mimeTypes: ["image/*"],
      })
        .then((blob) => {
          fileReader.readAsDataURL(blob);
        })
        .catch(reject);
    }),
};
