import { fetchAllGroupMessages } from './groupMeFetcher';

const start = async () => {
  const messages = await fetchAllGroupMessages('45622290');
  console.log(`Messages has length: ${messages.length}`);
  console.log(messages);
};

start();
