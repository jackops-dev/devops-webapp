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



