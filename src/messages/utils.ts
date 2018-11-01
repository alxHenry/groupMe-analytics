import { Message } from '../apiConsumers/groupMeFetcher';

export interface MessagesByUserMap {
  [userId: string]: Message[];
}

export interface UserIdToNameMap {
  [userId: string]: string;
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

export const getUserIdToNameMap = (messageByUserMap: MessagesByUserMap): UserIdToNameMap => {
  const userIdToNameMap: UserIdToNameMap = {};

  Object.keys(messageByUserMap).forEach(userId => {
    const messagesByUser = messageByUserMap[userId];
    if (!messagesByUser.length) {
      return userId;
    }

    const firstMessageName = messagesByUser[0].name;
    userIdToNameMap[userId] = firstMessageName;
  });

  return userIdToNameMap;
};

export const chunkMessages = (messages: Message[], chunkSize: number): Message[][] => {
  const chunks: Message[][] = [];

  while (messages.length > 0) {
    chunks.push(messages.splice(0, chunkSize));
  }

  return chunks;
};
