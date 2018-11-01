import { getMessagesAverageSentiment } from './apiConsumers/azureCognitiveServices';
import { fetchAllGroupMessages } from './apiConsumers/groupMeFetcher';
import { getGroupMessages, saveGroupMessages } from './dbHelper';
import { getMessagesByUserMap, getUserIdToNameMap, readGroupMessagesFromFile } from './messages/utils';
import db, { shutdownDB } from './database';

const groupId = '9817284'; // '13207297' '45622290' '9817284';

const start = async () => {
  // Prefer a json input if available
  let messages = readGroupMessagesFromFile(groupId);

  if (!messages.length) {
    messages = await getGroupMessages(groupId);
  }

  if (!messages.length) {
    messages = await fetchAllGroupMessages(groupId);
    console.log(`Completed fetching ${messages.length} messages.`);

    await saveGroupMessages(messages);
    console.log('Successfully wrote to the db!');
  } else {
    console.log(`Found ${messages.length} messages`);
  }

  const messagesByUserMap = getMessagesByUserMap(messages);
  const userIdToNameMap = getUserIdToNameMap(messagesByUserMap);
  const sentimentsByUserMap: { [userId: string]: number } = {};

  const acsPromises: Promise<number>[] = [];
  Object.keys(messagesByUserMap).forEach(userId => {
    // acsPromises.push(getMessagesAverageSentiment(messagesByUserMap[userId]));

    console.log(`User ${userIdToNameMap[userId]} has sent ${messagesByUserMap[userId].length}`);
  });

  const messagesByUserKeys = Object.keys(messagesByUserMap);
  const sentimentValues = await Promise.all(acsPromises);

  sentimentValues.forEach((value, index) => {
    const correspondingUserId = messagesByUserKeys[index];
    sentimentsByUserMap[correspondingUserId] = value;

    console.log(
      `Average sentiment for user ${userIdToNameMap[correspondingUserId]} is ${
        sentimentsByUserMap[correspondingUserId]
      }`
    );
  });
};

start();

process.on('SIGTERM', () => {
  shutdownDB();
});
