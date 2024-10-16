const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "bmp", "tiff", "webp"];
export function isImagePath(path: string): boolean {
  return IMAGE_EXTENSIONS.includes(path.split(".").pop() ?? "");
}

export function isValidImagePathRegex(path: string): boolean {
  // Ensure the path is not a directory and has a valid filename
  const imageExtensionRegex =
    /[\/\\]([^\/\\]+\.(png|jpg|jpeg|gif|bmp|tiff|webp))$/i;
  const ret = imageExtensionRegex.test(path);
  return ret;
}
