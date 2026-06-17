// pages/demoQAUploadPage.js
// Page Object Model for DemoQA Upload & Download page

import { test, expect } from '@playwright/test';
import FileValidator from '../utils/fileValidator.js';
import Logger from '../utils/logger.js';
import { launchBrowser, closeBrowser } from '../utils/browserHelper.js';
import { attachResponseData, displayValidationResults } from '../utils/reportHelper.js';

export class DemoQAUploadPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://demoqa.com/upload-download';
    this.fileInput = page.locator('#uploadFile');
    this.uploadedFilePath = page.locator('#uploadedFilePath');
  }

  async open() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.fileInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(1000);
  }

  async uploadFile(filePath) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500);
  }

  async getUploadedPathText() {
    await this.uploadedFilePath.waitFor({ state: 'visible', timeout: 10000 });
    return (await this.uploadedFilePath.textContent())?.trim() ?? '';
  }

  static async executeUploadAndAssertSuccess(fileName, label) {
    const validations = [];
    let browser;
    let context;
    let page;

    try {
      await test.step('GIVEN: Browser is launched with a fresh context', async () => {
        ({ browser, context, page } = await launchBrowser());
        Logger.info('Fresh browser context created');
      });

      const filePath = FileValidator.resolveTestFile(fileName);
      const fileDetails = FileValidator.validate(filePath);

      validations.push(
        { name: 'File Exists', passed: fileDetails.exists, details: fileDetails.filePath },
        { name: 'File Type Allowed', passed: fileDetails.isAllowedType, details: fileDetails.extension },
        {
          name: 'File Size Within Limit',
          passed: fileDetails.isWithinSizeLimit,
          details: `${fileDetails.sizeInMB} MB <= ${fileDetails.maxSizeMB} MB`,
        },
      );

      await attachResponseData('Validated File Details', fileDetails, 'json');

      const uploadPage = new DemoQAUploadPage(page);

      await test.step('WHEN: User opens DemoQA upload page and uploads file', async () => {
        await uploadPage.open();
        await uploadPage.uploadFile(filePath);
        Logger.success(`${label} uploaded`);
      });

      await test.step('THEN: Uploaded path should contain selected file name', async () => {
        const uploadedPathText = await uploadPage.getUploadedPathText();

        expect(uploadedPathText).toBeTruthy();
        expect(uploadedPathText).toContain(fileName);

        validations.push(
          { name: 'Upload Path Visible', passed: true, details: uploadedPathText },
          { name: 'Uploaded File Name Matches', passed: uploadedPathText.includes(fileName), details: fileName },
        );

        await attachResponseData(
          'Upload Result',
          {
            fileName,
            label,
            uploadedPath: uploadedPathText,
            status: 'Success',
          },
          'json',
        );
      });

      await displayValidationResults(validations);
    } finally {
      await closeBrowser(browser, context);
      Logger.info('Browser closed');
    }
  }
}
