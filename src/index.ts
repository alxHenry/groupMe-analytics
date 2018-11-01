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

  const acsPromises: Promise<number>[] = [];
  Object.keys(messagesByUserMap).forEach(userId => {
    acsPromises.push(getMessagesAverageSentiment(messagesByUserMap[userId]));
  });

  const messagesByUserKeys = Object.keys(messagesByUserMap);
  const sentimentValues = await Promise.all(acsPromises);

  sentimentValues.forEach((value, index) => {
    const correspondingUserId = messagesByUserKeys[index];
    sentimentsByUserMap[correspondingUserId] = value;

    console.log(`Average sentiment for user ${correspondingUserId} is ${sentimentsByUserMap[correspondingUserId]}`);
  });
};

start();
