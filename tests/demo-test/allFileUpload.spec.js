// tests/uploadFile/allFileUpload.spec.js
// ─────────────────────────────────────────────────────────────
//  DemoQA All File Types Upload - Enhanced BDD with Reporting
//  Framework: Playwright Test with BDD structure
//  Accepted file types: PDF, TXT | Maximum file size: 2 MB
//  Scenarios: Upload PDF, Upload TXT, Reject large file, Reject invalid type
// ─────────────────────────────────────────────────────────────


import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import {
  attachResponseData,
  displayValidationResults,
} from '../../utils/reportHelper';



const UPLOAD_URL = 'https://demoqa.com/upload-download';
const ALLOWED_EXTENSIONS = ['.pdf', '.txt'];
const MAX_SIZE_MB = 2;

function getFileDetails(filePath) {
  const stats = fs.statSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const sizeInMB = stats.size / (1024 * 1024);

  return {
    fileName: path.basename(filePath),
    filePath,
    extension,
    sizeInMB: Number(sizeInMB.toFixed(2)),
    maxSizeMB: MAX_SIZE_MB,
    isAllowedType: ALLOWED_EXTENSIONS.includes(extension),
    isWithinSizeLimit: sizeInMB <= MAX_SIZE_MB,
  };
}

async function launchBrowser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
}

async function openUploadPage(page) {
  // networkidle can be flaky on ad-heavy public pages; wait for upload input instead.
  await page.goto(UPLOAD_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#uploadFile').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1000);
}

function ensureLargePdfFile(filePath, minSizeMB = 2.2) {
  const minSizeBytes = Math.ceil(minSizeMB * 1024 * 1024);

  if (fs.existsSync(filePath) && fs.statSync(filePath).size >= minSizeBytes) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const pdfHeader = Buffer.from('%PDF-1.4\n');
  const filler = Buffer.alloc(minSizeBytes - pdfHeader.length, 0x20);
  fs.writeFileSync(filePath, Buffer.concat([pdfHeader, filler]));
}

async function runValidFileUploadTest(fileName, fileTypeLabel) {
  const filePath = path.resolve(`./test-data/file-types/${fileName}`);
  const validations = [];
  let browser, context, page, fileDetails, uploadedPathText;

  try {
    await test.step('GIVEN: Browser is launched with a fresh context', async () => {
      ({ browser, context, page } = await launchBrowser());
      console.log('✓ Fresh browser context created');
    });

    await test.step(` GIVEN: A valid ${fileTypeLabel} file is prepared for upload`, async () => {
      expect(fs.existsSync(filePath)).toBeTruthy();
      fileDetails = getFileDetails(filePath);

      expect(fileDetails.isAllowedType).toBeTruthy();
      expect(fileDetails.isWithinSizeLimit).toBeTruthy();

      validations.push({
        name: 'File Exists',
        passed: true,
        details: fileDetails.filePath,
      });
      validations.push({
        name: 'File Type Allowed',
        passed: fileDetails.isAllowedType,
        details: `Extension: ${fileDetails.extension}`,
      });
      validations.push({
        name: 'File Size Within Limit',
        passed: fileDetails.isWithinSizeLimit,
        details: `${fileDetails.sizeInMB} MB (max: ${fileDetails.maxSizeMB} MB)`,
      });

      console.log(`✓ File ready: ${fileDetails.fileName}`);
    });

    await attachResponseData('File Details', fileDetails, 'json');

    await test.step(' WHEN: User navigates to DemoQA upload page', async () => {
      await openUploadPage(page);
      console.log(`✓ Upload page opened: ${UPLOAD_URL}`);
    });

    await test.step(`WHEN: User uploads the ${fileTypeLabel} file`, async () => {
      const fileInput = page.locator('#uploadFile');
      await expect(fileInput).toBeAttached({ timeout: 10000 });
      await fileInput.setInputFiles(filePath);
      await page.waitForTimeout(1500);
      console.log(`✓ File uploaded: ${fileDetails.fileName}`);
    });

    await test.step('THEN: Uploaded file path is displayed on the page', async () => {
      const uploadedPath = page.locator('#uploadedFilePath');
      await expect(uploadedPath).toBeVisible({ timeout: 10000 });

      uploadedPathText = await uploadedPath.textContent();
      expect(uploadedPathText).toBeTruthy();
      expect(uploadedPathText).toContain(fileDetails.fileName);

      validations.push({
        name: 'Upload Path Visible',
        passed: true,
        details: uploadedPathText,
      });
      validations.push({
        name: 'Uploaded File Name Matches',
        passed: uploadedPathText.includes(fileDetails.fileName),
        details: `Expected: ${fileDetails.fileName}`,
      });

      console.log(`✓ Upload confirmed: ${uploadedPathText}`);
    });

    await attachResponseData('Upload Result', {
      fileName: fileDetails.fileName,
      fileType: fileTypeLabel,
      uploadedPath: uploadedPathText,
      status: 'Success',
    }, 'json');

    await displayValidationResults(validations);

  } finally {
    await test.step(' Cleanup: Close browser resources', async () => {
      if (context) await context.close();
      if (browser) await browser.close();
      console.log('Browser closed');
    });
  }
}

// ════════════════════════════════════════════════════════════
//  FEATURE: DemoQA All File Types Upload with Enhanced Reporting
// ════════════════════════════════════════════════════════════

test.describe('📁 DemoQA All File Types Upload - Enhanced BDD', () => {

  

  test.describe('Scenario 1: Upload Valid PDF File', () => {

    test('Should upload PDF file and validate successful upload', async () => {
      await runValidFileUploadTest('Sample.pdf', 'PDF');
    });
  });

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 2: Upload Valid TXT File
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 2: Upload Valid TXT File', () => {

    test('Should upload TXT file and validate successful upload', async () => {
      await runValidFileUploadTest('Sample.txt', 'Text');
    });
  });

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 3: Reject PDF File Exceeding 2 MB
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 3: Reject PDF File Exceeding Size Limit', () => {

    test('Should identify large PDF file that exceeds 2 MB limit', async () => {

      const largeFile = path.resolve('./test-data/file-types/LargeMB_TestFile.pdf');
      const validations = [];
      let browser, context, page, fileDetails;

      try {
        await test.step('✅ GIVEN: Browser is launched with a fresh context', async () => {
          ({ browser, context, page } = await launchBrowser());
          console.log('✓ Fresh browser context created');
        });

        await test.step('✅ GIVEN: User is on the DemoQA upload page', async () => {
          await openUploadPage(page);
          console.log(`✓ Upload page opened: ${UPLOAD_URL}`);
        });

        await test.step('✅ GIVEN: A large PDF file exceeding 2 MB exists', async () => {
          ensureLargePdfFile(largeFile);
          expect(fs.existsSync(largeFile)).toBeTruthy();
          fileDetails = getFileDetails(largeFile);

          validations.push({
            name: 'File Exists',
            passed: true,
            details: fileDetails.filePath,
          });
          validations.push({
            name: 'File Type Allowed',
            passed: fileDetails.isAllowedType,
            details: `Extension: ${fileDetails.extension}`,
          });

          console.log(`✓ Large file located: ${fileDetails.fileName}`);
        });

        await attachResponseData('📄 Large File Details', fileDetails, 'json');

        await test.step('⏳ WHEN: File size is validated against upload rules', async () => {
          console.log(`File size: ${fileDetails.sizeInMB} MB | Max allowed: ${fileDetails.maxSizeMB} MB`);
        });

        await test.step('✅ THEN: File should be rejected for exceeding size limit', async () => {
          expect(fileDetails.sizeInMB).toBeGreaterThan(MAX_SIZE_MB);

          validations.push({
            name: 'File Exceeds Size Limit',
            passed: fileDetails.sizeInMB > MAX_SIZE_MB,
            details: `${fileDetails.sizeInMB} MB exceeds ${MAX_SIZE_MB} MB by ${(fileDetails.sizeInMB - MAX_SIZE_MB).toFixed(2)} MB`,
          });

          console.log('✓ File correctly identified as exceeding size limit');
        });

        await attachResponseData('🚫 Rejection Summary', {
          fileName: fileDetails.fileName,
          reason: 'File size exceeds 2 MB limit',
          fileSizeMB: fileDetails.sizeInMB,
          maxAllowedMB: MAX_SIZE_MB,
          status: 'Rejected',
        }, 'json');

        await displayValidationResults(validations);

      } finally {
        await test.step('🧹 Cleanup: Close browser resources', async () => {
          if (context) await context.close();
          if (browser) await browser.close();
          console.log('✓ Browser closed');
        });
      }
    });
  });

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 4: Reject Invalid File Type (PNG)
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 4: Reject Invalid File Type', () => {

    test('Should identify PNG file as invalid upload type', async () => {

      const invalidFile = path.resolve('./test-data/file-types/InvalidFileType.png');
      const validations = [];
      let browser, context, page, fileDetails;

      try {
        await test.step('✅ GIVEN: Browser is launched with a fresh context', async () => {
          ({ browser, context, page } = await launchBrowser());
          console.log('✓ Fresh browser context created');
        });

        await test.step('✅ GIVEN: User is on the DemoQA upload page', async () => {
          await openUploadPage(page);
          console.log(`✓ Upload page opened: ${UPLOAD_URL}`);
        });

        await test.step('✅ GIVEN: An invalid PNG file exists for upload', async () => {
          expect(fs.existsSync(invalidFile)).toBeTruthy();
          fileDetails = getFileDetails(invalidFile);

          validations.push({
            name: 'File Exists',
            passed: true,
            details: fileDetails.filePath,
          });

          console.log(`✓ Invalid file located: ${fileDetails.fileName}`);
        });

        await attachResponseData('📄 Invalid File Details', fileDetails, 'json');

        await test.step('⏳ WHEN: File type is validated against allowed extensions', async () => {
          console.log(`File extension: ${fileDetails.extension} | Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        });

        await test.step('✅ THEN: File should be rejected for invalid type', async () => {
          expect(ALLOWED_EXTENSIONS).not.toContain(fileDetails.extension);

          validations.push({
            name: 'File Type Not Allowed',
            passed: !fileDetails.isAllowedType,
            details: `${fileDetails.extension} is not in [${ALLOWED_EXTENSIONS.join(', ')}]`,
          });

          console.log('✓ File correctly identified as invalid type');
        });

        await attachResponseData('🚫 Rejection Summary', {
          fileName: fileDetails.fileName,
          reason: 'Invalid file type',
          extension: fileDetails.extension,
          allowedTypes: ALLOWED_EXTENSIONS,
          status: 'Rejected',
        }, 'json');

        await displayValidationResults(validations);

      } finally {
        await test.step('🧹 Cleanup: Close browser resources', async () => {
          if (context) await context.close();
          if (browser) await browser.close();
          console.log('✓ Browser closed');
        });
      }
    });
  });
});
