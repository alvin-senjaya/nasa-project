const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
    // Setup step to connect to mongodb
    beforeAll(async () => {
        await mongoDisconnect();
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('Test GET /v1/launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect(200)
                .expect('Content-Type', /json/);
        });
    });

    describe('Test POST /v1/launches', () => {
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            destination: 'Kepler-62 f',
            launchDate: '2023-10-10',
        };

        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            destination: 'Kepler-62 f',
        };

        const launchDataWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            destination: 'Kepler-62 f',
            launchDate: 'boo',
        };

        test('It should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect(201)
                .expect('Content-Type', /json/);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);

            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect(400)
                .expect('Content-Type', /json/);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property',
            });
        });

        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect(400)
                .expect('Content-Type', /json/);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date',
            });
        });
    });
});
