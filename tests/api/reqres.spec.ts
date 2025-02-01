import { test, expect, request } from '@playwright/test';

const BASE_URL = 'https://reqres.in/api';
const MAX_RESPONSE_TIME_MS = 1000;

test.describe('API Reqres - Testes', () => {

  test('Listar usuários e validar dados', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users?page=2`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data).toBeInstanceOf(Array);
    body.data.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
      expect(user).toHaveProperty('email');
      expect(user.email).toMatch(/.+@.+\..+/);
    });
  });

  test('Criar um usuário', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users`, {
      data: { name: 'Rodrigo Oliveira', job: 'QA Engineer' }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.name).toBe('Rodrigo Oliveira');
    expect(body.job).toBe('QA Engineer');
  });

  test('Atualizar um usuário', async ({ request }) => {
    const response = await request.put(`${BASE_URL}/users/2`, {
      data: { name: 'Rodrigo Salles', job: 'QA Lead' }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('Rodrigo Salles');
    expect(body.job).toBe('QA Lead');
  });

  test('Valida se os tempos de resposta da API estão dentro de limites aceitá veis', async ({ request }) => {
    const startTime = Date.now(); // Captura o tempo antes da requisição
    const response = await request.get(`${BASE_URL}/users?page=2`);
    const endTime = Date.now(); // Captura o tempo depois da requisição

    const responseTime = endTime - startTime; // Calcula o tempo de resposta

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Verifica se o tempo de resposta é menor que 1s
  });

  test('Deletar usuário', async ({ request }) => {
    const response = await request.delete(`${BASE_URL}/users/999`);
    expect(response.status()).toBe(204);
  });

  test('Simular falha de rede ao listar usuários', async ({ page }) => {
    await page.route(`${BASE_URL}/users?page=2`, route => route.abort()); // Simula falha de rede

    try {
        // Faz a requisição para simular a falha
        await page.request.get(`${BASE_URL}/users?page=2`);
    } catch (error) {
        // Captura o erro da requisição e verifica se a mensagem de erro contém a falha de rede
        expect(error.message).toContain('net::ERR_FAILED'); // Verifica se o erro é de rede
    }
  });

  test('Simular timeout ao listar usuários', async ({ request }) => {
    try {
        await request.get(`${BASE_URL}/users?page=2`, { timeout: 10 }); // Força um timeout de 10ms
        throw new Error('A requisição não deveria ter sucesso');
    } catch (error) {
        // Verifica se a mensagem de erro contém 'timed out' ou 'connection timeout'
        const errorMessage = error.message.toLowerCase();
        const timeoutRegex = /timed out|connection timeout/;
        expect(timeoutRegex.test(errorMessage)).toBe(true);
    }
  });
  
});
