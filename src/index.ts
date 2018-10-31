import { fetchMessages } from './groupMeFetcher';

const start = async () => {
  const messages = await fetchMessages('45622290');
  console.log(messages);
};

start();
