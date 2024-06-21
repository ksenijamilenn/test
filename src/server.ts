import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';
import { transformData } from './transformData';

interface Item {
	fileUrl: string;
}

interface TransformedData {
	[key: string]: any[];
}

const app = express();
const PORT: number = 3000;
const cache = new NodeCache({ stdTTL: 600 });

app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

app.get('/api/files', async (req: Request, res: Response) => {
	const cacheKey = 'filesData';
	const cachedData = cache.get<TransformedData>(cacheKey);

	if (cachedData) {
		console.log('Returning cached data');
		return res.status(200).json(cachedData);
	}

	try {
		const response = await axios.get<{ items: Item[] }>(
			'https://rest-test-eight.vercel.app/api/test'
		);
		const transformedData = transformData(response.data.items);
		cache.set(cacheKey, transformedData);
		res.status(200).json(transformedData);
	} catch (error) {
		console.error('Error fetching data:', (error as Error).message);
		res.status(500).json({ error: 'Failed to fetch data' });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
