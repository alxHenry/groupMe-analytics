import fetch from 'node-fetch';
import { acsApiKeys } from '../../azure-credentials';
import { Message } from './groupMeFetcher';
import { chunkMessages } from '../messages/utils';
import { promises } from 'fs';

const apiUrl = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
const sentimentChunkSize = 1000;

interface AzureCognitiveServicesDocument {
  id: string;
  language: string;
  text: string;
}

interface ACSSentimentResponse {
  documents: ACSSentimentDocumentResponse[];
}

interface ACSSentimentDocumentResponse {
  id: string;
  score: number;
}

interface CountSumTuple {
  count: number;
  sum: number;
}

export const getMessagesSentiment = async (messages: Message[]): Promise<CountSumTuple> => {
  const body = {
    documents: messages.map(convertMessageToAcsDocument),
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Ocp-Apim-Subscription-Key': acsApiKeys.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`ACS response is not ok. Status: ${response.status}: ${response.statusText}`);
  }

  const payload: ACSSentimentResponse = await response.json();
  const documents = payload.documents;
  const sum = documents.reduce((acc, document) => acc + document.score, 0);

  return {
    sum,
    count: documents.length,
  };
};

export const getMessagesAverageSentiment = async (messages: Message[]): Promise<number> => {
  const messageChunks = chunkMessages(messages, sentimentChunkSize);
  const apiPromises: Promise<CountSumTuple>[] = [];

  messageChunks.forEach(chunk => {
    apiPromises.push(getMessagesSentiment(chunk));
  });

  console.log(`Azure cognitive services calls made: ${apiPromises.length}`);
  const countSumTuples = await Promise.all(apiPromises);

  let totalSum = 0;
  let totalCount = 0;
  countSumTuples.forEach(countSumTuple => {
    totalSum += countSumTuple.sum;
    totalCount += countSumTuple.count;
  });

  return totalSum / totalCount;
};

const convertMessageToAcsDocument = (message: Message): AzureCognitiveServicesDocument => ({
  id: message.id,
  language: 'en',
  text: message.text,
});
