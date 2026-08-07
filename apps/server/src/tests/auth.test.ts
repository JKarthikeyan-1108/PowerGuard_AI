import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  it('should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
      
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should require email and password for login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com'
      });
      
    expect(res.status).toBe(400); // Validation error
  });
});
