export type FileSystemModule = {
  saveFileAsString(
    fileName: string,
    content: string,
    options: {
      mimeType: string;
      extension: string;
    }
  ): Promise<void>;
};
