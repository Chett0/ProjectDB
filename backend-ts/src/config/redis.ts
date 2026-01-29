import { createClient } from 'redis';

const client = createClient({
    url: 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', process.env.REDIS_URL, err));
client.on('connect', () => console.log('Redis Client Connected'));

client.connect().catch((err) => {
    console.error('Failed to connect to Redis', err);
});

export default client;