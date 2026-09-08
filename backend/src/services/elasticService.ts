import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env';

const INDEX = 'emails';

export const esClient = new Client({ node: env.ELASTICSEARCH_URL });

export async function ensureIndex() {
  const exists = await esClient.indices.exists({ index: INDEX });
  if (exists) return;

  await esClient.indices.create({
    index: INDEX,
    mappings: {
      properties: {
        emailId: { type: 'keyword' },
        campaignId: { type: 'keyword' },
        userId: { type: 'keyword' },
        recipient: { type: 'keyword' },
        subject: { type: 'text' },
        body: { type: 'text' },
        status: { type: 'keyword' },
        sentAt: { type: 'date' },
        scheduledAt: { type: 'date' },
        createdAt: { type: 'date' },
      },
    },
  });
}

export interface EmailDocument {
  emailId: string;
  campaignId: string | null;
  userId: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string | null;
  scheduledAt: string;
  createdAt: string;
}

export async function indexEmail(doc: EmailDocument) {
  await esClient.index({
    index: INDEX,
    id: doc.emailId,
    document: doc,
  });
}

export async function updateEmailStatus(emailId: string, status: string, sentAt?: string) {
  await esClient.update({
    index: INDEX,
    id: emailId,
    doc: { status, ...(sentAt ? { sentAt } : {}) },
  });
}

export async function searchEmails(userId: string, query: string) {
  const result = await esClient.search<EmailDocument>({
    index: INDEX,
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: ['subject', 'body', 'recipient'],
            },
          },
        ],
        filter: [{ term: { userId } }],
      },
    },
    size: 50,
  });

  return result.hits.hits.map((hit) => hit._source);
}
