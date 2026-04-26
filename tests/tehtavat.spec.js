const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const tehtavat = JSON.parse(fs.readFileSync('./keski/themes/custom/templates/content/tehtavat.json', 'utf8'));
const huomaa = JSON.parse(fs.readFileSync('./keski/themes/custom/templates/content/huomaaTehtavat.json', 'utf8'));
const allTasks = [...tehtavat, ...huomaa];

function getCleanAnswer(regexString) {
	const firstOption = regexString
		.replace(/^\^\\s*\(?/, '')
		.replace(/\)?\\s*\$$/, '')
		.split('|')[0];

	return firstOption
		.replace(/\\s[+*]/g, ' ')
		.replace(/\\s/g, ' ')
		.replace(/\[([A-Z])([a-z])\]/g, '$1')
		.replace(/[\^\$\(\)\?\*\+\:]/g, '')
		.replace(/\\/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

test('Verify all tasks accept all valid answers', async ({ page }) => {
	test.setTimeout(150000);
	await page.goto('https://keski.finna-pre.fi/Content/tehtavat');

	for (const group of allTasks) {
		for (const lomake of group.lomakkeet) {
			await page.goto(`https://keski.finna-pre.fi/Content/tehtavat#${lomake.llid}`);
			const forms = page.locator('.tarkistus-lomake');
			for (let i = 0; i < lomake.kysymykset.length; i++) {
				const questionData = lomake.kysymykset[i];
				const rawOptions = questionData.vastaus
					.replace(/^\^\\s*\(?/, '')
					.replace(/\)?\\s*\$$/, '')
					.split('|');
				for (const option of rawOptions) {
					const testAnswer = getCleanAnswer(option);
					const input = forms.nth(i).locator('input.vastaus-kentta');
					await input.evaluate((el) => el.scrollIntoView({ block: 'center' }));
					await input.fill(testAnswer);
					await input.press('Enter');
					const container = forms.nth(i).locator('..');
					await expect(container).toHaveClass(/oikea/, { timeout: 3000 });
				}
			}
		}
	}
});

test('Triggering the return confirmation modal', async ({ page }) => {
	const firstTask = allTasks[0].lomakkeet[0].llid;
	await page.goto(`https://keski.finna-pre.fi/Content/tehtavat#${firstTask}`);
	const input = page.locator('input.vastaus-kentta').first();
	await input.fill('Checking modal...');
	await input.evaluate((el) => el.blur());
	const palaaBtn = page.locator('.palaa-alkuun').first();
	await palaaBtn.click();
	const modal = page.locator('#confirmReturnModal');
	await expect(modal).toBeVisible();
	await expect(modal).toContainText('Haluatko varmasti palata');
	await modal.locator('button:has-text("En")').click();
	await expect(modal).toBeHidden();
});

test('No confirmation modal on clean or empty form', async ({ page }) => {
	const firstTask = allTasks[0].lomakkeet[0].llid;
	await page.goto(`https://keski.finna-pre.fi/Content/tehtavat#${firstTask}`);
	const palaaBtn = page.locator('.palaa-alkuun').first();
	await expect(palaaBtn).toBeVisible();
	await palaaBtn.click();
	const modal = page.locator('#confirmReturnModal');
	await expect(modal).not.toBeVisible();
	await expect(page.locator('#otsikko')).toHaveText('Mobiilitehtävät');
});

test('Triggering wrong answers validation', async ({ page }) => {
	const firstTask = allTasks[0].lomakkeet[0].llid;
	await page.goto(`https://keski.finna-pre.fi/Content/tehtavat#${firstTask}`);
	const input = page.locator('input.vastaus-kentta').first();
	const container = input.locator('..').locator('..');
	await input.fill('Väärä vastaus');
	await input.evaluate((el) => el.blur());
	await expect(container).toHaveClass(/vaara/);
});

test('Triggers modal on invalid form but returns cleanly after correcting', async ({ page }) => {
	const firstLomake = allTasks[0].lomakkeet[0];
	await page.goto(`https://keski.finna-pre.fi/Content/tehtavat#${firstLomake.llid}`);
	const inputs = page.locator('input.vastaus-kentta');
	const count = await inputs.count();
	const palaaBtn = page.locator('.palaa-alkuun').first();
	const modal = page.locator('#confirmReturnModal');
	for (let i = 0; i < count; i++) {
		await inputs.nth(i).fill('Väärä');
		await inputs.nth(i).press('Tab');
	}
	await palaaBtn.click();
	await expect(modal).toBeVisible();
	await modal.locator('button:has-text("En")').click({ force: true });
	for (let i = 0; i < count; i++) {
		const questionData = firstLomake.kysymykset[i];
		const correctAnswer = getCleanAnswer(questionData.vastaus);

		await inputs.nth(i).fill(correctAnswer);
		await inputs.nth(i).press('Enter');

		const rowContainer = inputs.nth(i).locator('xpath=../..');
		await expect(rowContainer).toHaveClass(/oikea/);
	}
	await palaaBtn.click();
	await expect(modal).not.toBeVisible();
	await expect(page.locator('#otsikko')).toHaveText('Mobiilitehtävät');
});
