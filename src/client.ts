import { Client } from '@notionhq/client'
import {
  CreatePageParameters,
  QueryDatabaseParameters,
  UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints'
import { getNotionToken } from './config'

/**
 * EnumPropertyTypes is an enum of all the possible property types
 * in a Notion database.
 */
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

// This function extracts the user's filter from the query parameters
// It is used in the query function to filter the database query

export type Filter = QueryDatabaseParameters['filter']

/* Creating a new instance of the Notion client. */
const notionClient = new Client({
  auth: getNotionToken(),
})

/**
 * It returns a database from Notion
 * @param {string} databaseId - The ID of the database you want to query.
 * @param {Filter} [filter] - A filter object that specifies the conditions for the query.
 * @param {number} [pageSize] - The number of results to return. If you don't specify this, it will
 * return all results.
 * @param sorts - An array of objects that specify the sort order of the results.
 * @returns The database with the given id.
 */
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

/**
 * It takes a page ID and a property ID and returns the property value
 * @param {string} pageId - The ID of the page you want to get the property from.
 * @param {string} propertyId - The ID of the property you want to retrieve.
 * @returns The value of the property
 */
export async function getPageProps(pageId: string, propertyId: string) {
  return await notionClient.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  })
}

/**
 * It takes a page ID and a set of properties, and updates the page with those properties
 * @param {string} pageId - The ID of the page you want to update.
 * @param properties - {
 * @returns The updated page.
 */
export async function updateNotionPage(pageId: string, properties: UpdatePageParameters['properties']) {
  return await notionClient.pages.update({
    page_id: pageId,
    properties,
  })
}

/**
 * It creates a new page in Notion
 * @param {string} databaseId - The ID of the database you want to create the page in.
 * @param properties - {
 * @returns A promise that resolves to a PageResponse
 */
export function createNotionPage(databaseId: string, properties: CreatePageParameters['properties']) {
  return notionClient.pages.create({
    parent: {
      type: 'database_id',
      database_id: databaseId,
    },
    properties: properties as any,
  })
}

/**
 * It takes a pageId and returns a promise that resolves to a response from the Notion API
 * @param {string} pageId - The ID of the page you want to delete.
 * @returns A promise that resolves to a page object.
 */
export function deleteNotionPage(pageId: string) {
  return notionClient.pages.update({
    page_id: pageId,
    archived: true,
  })
}

export default notionClient
