import { getMessagesAverageSentiment } from './apiConsumers/azureCognitiveServices';
import { fetchAllGroupMessages } from './apiConsumers/groupMeFetcher';
import { getGroupMessages, saveGroupMessages } from './dbHelper';
import { getMessagesByUserMap } from './messages/utils';

const groupId = '45622290';

const start = async () => {
  let messages = await getGroupMessages(groupId);

  if (!messages.length) {
    messages = await fetchAllGroupMessages(groupId);
    saveGroupMessages(messages);
  }

  const messagesByUserMap = getMessagesByUserMap(messages);
  const sentimentsByUserMap: { [userId: string]: number } = {};

  Object.keys(messagesByUserMap).forEach(async userId => {
    sentimentsByUserMap[userId] = await getMessagesAverageSentiment(messagesByUserMap[userId]);
    console.log(`Average sentiment for user ${userId} is ${sentimentsByUserMap[userId]}`);
  });
};

start();
