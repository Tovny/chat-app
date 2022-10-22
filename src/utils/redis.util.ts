import * as redis from 'redis';

export const client = redis.createClient();

client.connect().then(() => console.log('Redis client connected.'));
