import { Message } from '../apiConsumers/groupMeFetcher';

export interface MessagesByUserMap {
  [userId: string]: Message[];
}

export const getMessagesByUserMap = (messages: Message[]): MessagesByUserMap => {
  const messagesByUsers: MessagesByUserMap = {};

  messages.forEach(message => {
    const userId = message.senderId;
    const usersMessages = messagesByUsers[userId];

    if (usersMessages) {
      usersMessages.push(message);
    } else {
      messagesByUsers[userId] = [message];
    }
  });

  return messagesByUsers;
};
