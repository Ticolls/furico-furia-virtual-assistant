import { CohereClientV2 } from 'cohere-ai';
import { API_KEY } from './config';

export const cohere = new CohereClientV2({ token: API_KEY });