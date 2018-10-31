import { getGroupMessages, saveGroupMessages } from './dbHelper';
import { fetchAllGroupMessages } from './groupMeFetcher';

const groupId = '45622290';

const start = async () => {
  let messages = await getGroupMessages(groupId);

  if (!messages.length) {
    messages = await fetchAllGroupMessages(groupId);
    saveGroupMessages(messages);
  }

  console.log(messages);
};

start();
