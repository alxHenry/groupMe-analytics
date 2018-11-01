import db from './database';
import { UpdateWriteOpResult } from 'mongodb';
import { Message } from './apiConsumers/groupMeFetcher';
import { chunkMessages } from './messages/utils';

const dbChunkSize = 500;

export const getGroupMessages = async (groupId: string): Promise<Message[]> => {
  const groupCollection = (await db).collection('groups');
  const group = await groupCollection.findOne({
    id: groupId,
  });

  if (!group || !group.messages) {
    return [];
  }

  return group.messages;
};

export const saveGroupMessages = async (messages: Message[]) => {
  if (!messages.length) {
    return;
  }

  const groupId = messages[0].groupId;
  const messageChunks = chunkMessages(messages, dbChunkSize);
  const writePromises: Promise<UpdateWriteOpResult>[] = [];

  messageChunks.forEach(async chunk => {
    const groupCollection = (await db).collection('groups');
    writePromises.push(
      groupCollection.updateOne(
        {
          id: groupId,
        },
        {
          $push: { messages: { $each: chunk } },
        },
        {
          upsert: true,
        }
      )
    );
  });

  return Promise.all(writePromises);
};
