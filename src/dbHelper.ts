import db from './database';
import { Message } from './groupMeFetcher';

export const saveGroupMessages = (messages: Message[]) => {
  if (!messages.length) {
    return;
  }

  const groupDoc = db.collection('groups').doc(messages[0].groupId);
  groupDoc.set({
    messages,
  });
};
