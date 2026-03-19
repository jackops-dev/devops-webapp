const request = require('supertest');
const app = require('./app');

describe ('GET /users', ()=> {
	it('should return a list of users as JSON', async () => {
	const response = await request(app).get('/users');
	expect(response.statusCode).toBe(200);
	expect(response.body).toEqual([
	 {id: 1, name: 'Jack' },
	 {id: 2, name: 'Anna' }
	]);
       });
     });

describe('GET /', () => {
 test('should return Hello Dev Ops World', async() => {
  const res = await request(app).get('/');
  expect(res.text).toContain('Hello DevOps World');
  expect(res.statusCode).toBe(200);
 });
});

describe('GET /notfound', () => {
  test('should return 404 for unknown route', async () => {
    const res = await request(app).get('/notfound');
    expect(res.statusCode).toBe(404);
  });
});
