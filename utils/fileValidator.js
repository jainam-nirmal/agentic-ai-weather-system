import path from 'path';
import fs from 'fs';

class FileValidator {
  static ALLOWED_EXTENSIONS = ['.pdf', '.txt'];
  static MAX_SIZE_MB = 2;

  static resolveTestFile(fileName, subDir = 'file-types') {
    return path.resolve(`./test-data/${subDir}/${fileName}`);
  }

  static getFileDetails(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const exists = fs.existsSync(filePath);
    const sizeInMB = exists
      ? Number((fs.statSync(filePath).size / (1024 * 1024)).toFixed(2))
      : 0;

    return {
      fileName: path.basename(filePath),
      filePath,
      extension,
      sizeInMB,
      maxSizeMB: FileValidator.MAX_SIZE_MB,
      exists,
      isAllowedType: FileValidator.ALLOWED_EXTENSIONS.includes(extension),
      isWithinSizeLimit: sizeInMB <= FileValidator.MAX_SIZE_MB,
    };
  }

  static validate(filePath) {
    const details = FileValidator.getFileDetails(filePath);

    if (!details.exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (!details.isAllowedType) {
      throw new Error(`Invalid file type: ${details.extension}`);
    }

    if (!details.isWithinSizeLimit) {
      throw new Error('File size exceeds 2MB');
    }

    return details;
  }
}

export default FileValidator;
