import { Request, Response } from 'express';
import { getMessagesAverageSentiment } from '../../apiConsumers/azureCognitiveServices';
import { fetchAllGroupMessages } from '../../apiConsumers/groupMeFetcher';
import { getGroupMessages, saveGroupMessages } from '../../dbHelper';
import { getMessagesByUserMap, getUserIdToNameMap, readGroupMessagesFromFile } from '../../messages/utils';

const groupId = '13207297'; // '13207297' '45622290' '9817284';

export const startGroupMeAnalyticsForGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;

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

  const acsPromises: Promise<number>[] = [];
  Object.keys(messagesByUserMap).forEach(userId => {
    const usersLast1000Messages = messagesByUserMap[userId].slice(0, 1000);
    acsPromises.push(getMessagesAverageSentiment(usersLast1000Messages));

    console.log(`User ${userIdToNameMap[userId]} has sent ${messagesByUserMap[userId].length}`);
  });

  const messagesByUserKeys = Object.keys(messagesByUserMap);
  const sentimentValues = await Promise.all(acsPromises);
  const namesToSentimentValuesMap: { [userName: string]: number } = {};

  sentimentValues.forEach((value, index) => {
    const correspondingUserId = messagesByUserKeys[index];
    const userName = userIdToNameMap[correspondingUserId];

    namesToSentimentValuesMap[userName] = value;
    console.log(`Average sentiment for user ${userName} is ${value}`);
  });

  res.send(JSON.stringify(namesToSentimentValuesMap));
};
