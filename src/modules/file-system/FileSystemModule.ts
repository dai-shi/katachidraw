export type FileSystemModule = {
  saveSvgFile(content: string): Promise<void>;
  loadImageFile(): Promise<string>;
};
