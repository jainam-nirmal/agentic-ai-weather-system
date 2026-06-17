// tests/refactor/demo.spec.js
// DemoQA File Upload - Refactored BDD scenarios with POM + helpers

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { DemoQAUploadPage } from '../../pages/demoQAUploadPage.js';
import FileValidator from '../../utils/fileValidator.js';
import { attachResponseData } from '../../utils/reportHelper.js';

function ensurePngFile(filePath) {
  if (fs.existsSync(filePath)) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tinyPngBytes = Buffer.from(
    '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000000020001E221BC330000000049454E44AE426082',
    'hex',
  );
  fs.writeFileSync(filePath, tinyPngBytes);
}

test.describe('DemoQA File Upload Validation (POM + Helpers)', () => {
  test('Scenario 1: Upload valid PDF file successfully', async () => {
    await DemoQAUploadPage.executeUploadAndAssertSuccess('Sample.pdf', 'PDF file');
  });

  test('Scenario 2: Upload valid TXT file successfully', async () => {
    await DemoQAUploadPage.executeUploadAndAssertSuccess('Sample.txt', 'Text file');
  });

  test('Scenario 3: Reject invalid PNG file type', async () => {
    const invalidFilePath = FileValidator.resolveTestFile('InvalidFileType.png');
    ensurePngFile(invalidFilePath);

    await test.step('GIVEN: Invalid PNG file exists in test data folder', async () => {
      const fileDetails = FileValidator.getFileDetails(invalidFilePath);

      expect(fileDetails.exists).toBeTruthy();
      expect(fileDetails.extension).toBe('.png');
      expect(fileDetails.isAllowedType).toBeFalsy();

      await attachResponseData('Invalid File Details', fileDetails, 'json');
    });

    await test.step('WHEN/THEN: Validation should throw invalid file type error', async () => {
      expect(() => FileValidator.validate(invalidFilePath)).toThrow('Invalid file type: .png');
    });
  });

  test('Scenario 4: Reject file when size is greater than 2 MB', async () => {
    const largeFilePath = FileValidator.resolveTestFile('LargeMB_TestFile.pdf');

    await test.step('GIVEN: Large file exists in test data folder', async () => {
      const fileDetails = FileValidator.getFileDetails(largeFilePath);

      expect(fileDetails.exists).toBeTruthy();
      expect(fileDetails.extension).toBe('.pdf');
      expect(fileDetails.sizeInMB).toBeGreaterThan(FileValidator.MAX_SIZE_MB);
      expect(fileDetails.isWithinSizeLimit).toBeFalsy();

      await attachResponseData('Large File Details', fileDetails, 'json');
    });

    await test.step('WHEN/THEN: Validation should throw file size error', async () => {
      expect(() => FileValidator.validate(largeFilePath)).toThrow('File size exceeds 2MB');
    });
  });
});
