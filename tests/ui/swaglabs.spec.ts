import { test, expect } from '@playwright/test';

const URL = 'https://www.saucedemo.com/';

async function login(page, username, password) {
  await page.goto(URL);
  await page.fill('[data-test="username"]', username);
  await page.fill('[data-test="password"]', password);
  await page.click('[data-test="login-button"]');
}

async function countCart(page, cartNumber) {
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(cartNumber)
}

test.describe('Swag Labs - UI Tests', () => {
  
  test('Login com credenciais corretas', async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
    await expect(page.locator('[data-test="inventory-container"]')).toBeVisible();
  });

  test('Login com credenciais incorretas', async ({ page }) => {
    await login(page, 'wrong_user', 'wrong_password');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test('Adicionar e remover produtos do carrinho', async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');

    // Adicionar produtos
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await countCart(page, '1')
    await page.click('[data-test="add-to-cart-sauce-labs-bike-lighttt"]');
    await countCart(page, '2')
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await countCart(page, '3')

    // Remover produtos
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    await countCart(page, '2')
    await page.click('[data-test="remove-sauce-labs-bike-light"]');
    await countCart(page, '1')

    // Validar se um item permanece no carrinho
    await page.click('[data-test="shopping-cart-link"]');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bolt T-Shirt')
  });

  test('Simulação de erro na finalização da compra', async ({page})=> {
    await login(page, 'standard_user', 'secret_sauce');
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await countCart(page, '1')
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await countCart(page, '2')
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await countCart(page, '3')
    await page.click('[data-test="shopping-cart-link"]');
    await page.click('[data-test="checkout"]');
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toBeVisible();

  })

});
