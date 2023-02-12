import { Client } from '@notionhq/client'
import {
  CreatePageParameters,
  CreatePageResponse,
  GetPagePropertyResponse,
  QueryDatabaseParameters,
  QueryDatabaseResponse,
  UpdatePageParameters,
  UpdatePageResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { Model } from './model'
import { Schema } from './schema'

export class NotionPlus {
  // eslint-disable-next-line no-use-before-define
  private static instance: NotionPlus
  private readonly notionClient: Client
  private readonly models: { [key: string]: Model<unknown> } = {}

  private constructor(notionToken: string) {
    this.notionClient = new Client({ auth: notionToken })
  }

  public static getInstance(notionToken: string): NotionPlus {
    if (!NotionPlus.instance) {
      NotionPlus.instance = new NotionPlus(notionToken)
    }
    return NotionPlus.instance
  }

  public getModel<T>(databaseId: string, schema: Schema<T>): Model<T> {
    const modelKey = `${databaseId}_${JSON.stringify(schema)}`
    if (!this.models[modelKey]) {
      this.models[modelKey] = new Model<T>(NotionPlus.instance, databaseId, schema)
    }
    return this.models[modelKey] as Model<T>
  }

  public getNotionClient(): Client {
    return this.notionClient
  }

  public async getDatabases(
    databaseId: string,
    filter?: QueryDatabaseParameters['filter'],
    pageSize?: number,
    sorts: QueryDatabaseParameters['sorts'] = []
  ): Promise<QueryDatabaseResponse> {
    return await this.notionClient.databases.query({
      database_id: databaseId,
      ...(filter && { filter }),
      page_size: pageSize || 0,
      sorts,
    })
  }

  public async getPageProps(pageId: string, propertyId: string): Promise<GetPagePropertyResponse> {
    return await this.notionClient.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    })
  }

  public async updateNotionPage(
    pageId: string,
    properties: UpdatePageParameters['properties']
  ): Promise<UpdatePageResponse> {
    return await this.notionClient.pages.update({
      page_id: pageId,
      properties,
    })
  }

  public async createNotionPage(
    databaseId: string,
    properties: CreatePageParameters['properties']
  ): Promise<CreatePageResponse> {
    return await this.notionClient.pages.create({
      parent: {
        type: 'database_id',
        database_id: databaseId,
      },
      properties: properties as any,
    })
  }
}
