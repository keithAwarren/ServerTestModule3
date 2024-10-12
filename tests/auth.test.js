const request = require('supertest');
const app = require('../server'); 
const db = require('../config/db'); 

beforeAll((done) => {
    // Clear the users table before running tests
    db.query('DELETE FROM users', (err) => {
        if (err) throw err;
        done();
    });
});

describe('Auth Endpoints', () => {
    // Test the /register endpoint
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.text).toBe('User created');
    });

    // Test the /login endpoint
    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    // Test login with wrong credentials
    it('should fail login with incorrect password', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.text).toBe('Incorrect password');
    });
});
