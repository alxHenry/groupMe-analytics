import db from './database';
import { Message } from './groupMeFetcher';

export const getGroupMessages = async (groupId: string): Promise<Message[]> => {
  const groupRef = db.collection('groups').doc(groupId);
  const groupDoc = await groupRef.get();
  return groupDoc.data().messages;
};

export const saveGroupMessages = (messages: Message[]) => {
  if (!messages.length) {
    return;
  }

  const groupDoc = db.collection('groups').doc(messages[0].groupId);
  groupDoc.set({
    messages,
  });
};
