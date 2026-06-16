import path from "path";
import fs from "fs";


class FileValidator {

    static validate(filePath) {

        const allowedTypes = [
            '.pdf',
            '.txt',
            '.docx'
        ];

        const extension =
            path.extname(filePath).toLowerCase();

        if (!allowedTypes.includes(extension)) {

            throw new Error(
                `Invalid file type : ${extension}`
            );
        }

        const size =
            fs.statSync(filePath).size;

        const sizeMB =
            size / (1024 * 1024);

        if (sizeMB > 2) {

            throw new Error(
                'File size exceeds 2MB'
            );
        }

        return true;
    }
}

module.exports = FileValidator;