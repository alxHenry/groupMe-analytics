import fetch from 'node-fetch';
import acsApiKeys from '../../azure-credentials';
import { Message } from './groupMeFetcher';

const apiUrl = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';

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

export const getMessagesAverageSentiment = async (messages: Message[]): Promise<number> => {
  const body = {
    documents: messages.map(convertMessageToAcsDocument),
  };

  let payload: ACSSentimentResponse;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Ocp-Apim-Subscription-Key': acsApiKeys.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('ACS response is not ok');
    }

    payload = await response.json();
  } catch (err) {
    console.log(`Failure getting text sentiment: ${err}`);
    return 0.5;
  }

  const documents = payload.documents;
  const sum = documents.reduce((acc, document) => acc + document.score, 0);
  const avg = sum / documents.length;

  return avg;
};

const convertMessageToAcsDocument = (message: Message): AzureCognitiveServicesDocument => ({
  id: message.id,
  language: 'en',
  text: message.text,
});
