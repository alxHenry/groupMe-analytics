import { saveGroupMessages, getGroupMessages } from './dbHelper';
import { fetchAllGroupMessages } from './groupMeFetcher';

const start = async () => {
  // const messages = await fetchAllGroupMessages('45622290');
  // saveGroupMessages(messages);
  const messages = await getGroupMessages('45622290');
  console.log(messages.length);
};

start();
