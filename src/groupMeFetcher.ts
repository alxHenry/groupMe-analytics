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
  text: rawMessage.text,
});

export const fetchMessages = async (groupId: string, beforeMessageId?: string): Promise<Message[]> => {
  let payload: RawResponse;
  try {
    const response = await fetch(`${groupMeBaseUrl}/groups/${groupId}/messages?limit=20&token=${accessToken}`);
    payload = await response.json();
  } catch (err) {
    console.log(`Error fetching messages: ${err}`);
    return [];
  }

  if (!payload.response || !payload.response.messages || !payload.response.messages.length) {
    return [];
  }

  if (payload.meta.errors) {
    payload.meta.errors.map(err => {
      console.log(`Error getting messages: ${err}`);
    });
    return [];
  }

  return payload.response.messages.map(transformRawMessage);
};
