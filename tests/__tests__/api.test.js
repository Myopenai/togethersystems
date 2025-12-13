const request = require('supertest');
const { app, server } = require('../../src/server');

describe('API Endpoints', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/health', () => {
    it('should return server status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /api/regions', () => {
    it('should return all regions', async () => {
      const res = await request(app).get('/api/regions');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });
});
