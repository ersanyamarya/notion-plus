import { Client } from '@notionhq/client'
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
export type EnumPropertyTypes =
  | 'title'
  | 'rich_text'
  | 'checkbox'
  | 'select'
  | 'multi_select'
  | 'number'
  | 'date'
  | 'string'
  | 'boolean'
  | 'files'
  | 'email'
  | 'url'
  | 'phone_number'
  | 'created_by'
  | 'created_time'
  | 'status'
export type Filter = QueryDatabaseParameters['filter']

const notionClient = new Client({
  auth: process.env.NOTION_TOKEN,
})

export async function getDatabase(
  databaseId: string,
  filter?: Filter,
  pageSize?: number,
  sorts: QueryDatabaseParameters['sorts'] = []
) {
  return await notionClient.databases.query({
    database_id: databaseId,
    ...(filter && { filter }),
    page_size: pageSize || 0,
    sorts,
  })
}

export async function getPageProps(pageId: string, propertyId: string) {
  return await notionClient.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  })
}

export default notionClient
