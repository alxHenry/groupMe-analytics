import { saveGroupMessages } from './dbHelper';
import { fetchAllGroupMessages } from './groupMeFetcher';

const start = async () => {
  const messages = await fetchAllGroupMessages('45622290');
  saveGroupMessages(messages);
};

start();
