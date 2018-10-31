import fetch from 'node-fetch';
import { accessToken } from '../groupme-credentials';

const groupMeBaseUrl = 'https://api.groupme.com/v3';

export type SenderType = 'user';

export interface Message {
  id: string;
  createdAt: number;
  favoritedBy: string[];
  name: string;
  senderId: string;
  groupId: string;
  text: string;
}

interface RawResponse {
  response: {
    count: number;
    messages: RawMessage[];
  };
  meta: {
    code: number;
    errors?: string[];
  };
}

interface RawMessage {
  attachments: any[];
  avatar_url: string;
  created_at: number;
  favorited_by: string[];
  group_id: string;
  id: string;
  name: string;
  sender_id: string;
  sender_type: SenderType;
  source_guid: string;
  system: false;
  text: string;
  user_id: string;
}

const transformRawMessage = (rawMessage: RawMessage): Message => ({
  id: rawMessage.id,
  createdAt: rawMessage.created_at,
  favoritedBy: rawMessage.favorited_by,
  name: rawMessage.name,
  senderId: rawMessage.sender_id,
  groupId: rawMessage.group_id,
  text: rawMessage.text,
});

const fetchGroupMessages = async (
  groupId: string,
  amountToFetch: number,
  beforeMessageId?: string
): Promise<Message[]> => {
  let url = `${groupMeBaseUrl}/groups/${groupId}/messages?limit=${amountToFetch}&token=${accessToken}`;
  url = beforeMessageId ? `${url}&before_id=${beforeMessageId}` : url;

  const response = await fetch(url);
  if (response.status === 304) {
    // There are no more messages to fetch from the group
    return [];
  }
  if (!response.ok) {
    throw 'Error fetching messages';
  }

  const payload: RawResponse = await response.json();

  if (payload.meta.errors) {
    throw `Error getting messages: ${payload.meta.errors}`;
  }

  return payload.response.messages.map(transformRawMessage);
};

export const fetchAllGroupMessages = async (groupId: string): Promise<Message[]> => {
  let fulfilledMessages: Message[] = [];
  let lastMessageId = '';

  while (true) {
    let newMessages: Message[];
    try {
      newMessages = await fetchGroupMessages(groupId, 100, lastMessageId);
    } catch (err) {
      console.log(`Failed to fetch messages: ${err}`);
      return [];
    }
    fulfilledMessages = [...fulfilledMessages, ...newMessages];

    if (newMessages.length === 0) {
      return fulfilledMessages;
    }

    lastMessageId = newMessages[newMessages.length - 1].id;
  }
};
