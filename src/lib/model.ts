import {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints'
import { NotionPlus } from './notion-plus'
import { EnumPropertyTypes, NotionRecord, Schema } from './schema'
import { getNotionPropertyFromData, prettyDbData } from './utils'

export type FindArguments<T> = {
  filter?: QueryDatabaseParameters['filter']
  pageSize?: number
  sorts?: Array<
    | {
        property: keyof (T & NotionRecord)
        direction: 'ascending' | 'descending'
      }
    | {
        timestamp: 'created_time' | 'last_edited_time'
        direction: 'ascending' | 'descending'
      }
  >
  metadata?: boolean
}

export type FilterResponse<T> = {
  results: (T & NotionRecord)[]
  count: number
  hasMore: boolean
}

export class Model<T> {
  private notionPlus: NotionPlus
  private databaseId: string
  private schema: Schema<T>

  constructor(notionPlus: NotionPlus, databaseId: string, schema: Schema<T>) {
    this.notionPlus = notionPlus
    this.databaseId = databaseId
    this.schema = schema
  }

  private type = (property: string): EnumPropertyTypes => this.schema.notionSchema[property]

  private convertToNotionProperties = (items: Partial<T>): PageObjectResponse['properties'] => {
    return Object.entries(items).reduce((acc, [key, value]) => {
      acc = {
        ...acc,
        ...getNotionPropertyFromData[this.type(key)](value, key),
      }

      return acc
    }, {} as PageObjectResponse['properties'])
  }

  private convertToModel = (
    item: PageObjectResponse | PartialPageObjectResponse,
    metadata = false
  ): T & NotionRecord => {
    return prettyDbData<T & NotionRecord>(item as PageObjectResponse, metadata)
  }

  public async find({ filter, pageSize, sorts, metadata }: FindArguments<T>): Promise<FilterResponse<T>> {
    const database = await this.notionPlus.getDatabases(
      this.databaseId,
      filter,
      pageSize,
      sorts as QueryDatabaseParameters['sorts']
    )

    const results = database.results.map((item: PageObjectResponse) => this.convertToModel(item, metadata))
    return {
      results,
      hasMore: database.has_more,
      count: results.length,
    }
  }

  public async create(item: Partial<T>, metaData = false): Promise<T & NotionRecord> {
    const createdItem = await this.notionPlus.createNotionPage(this.databaseId, this.convertToNotionProperties(item))
    return this.convertToModel(createdItem, metaData)
  }

  public async update(id: string, data: Partial<T>, metaData = false): Promise<T & NotionRecord> {
    const updatedItem = await this.notionPlus.updateNotionPage(id, this.convertToNotionProperties(data))
    return this.convertToModel(updatedItem, metaData)
  }

  public async archive(id: string): Promise<void> {
    await this.notionPlus.archiveNotionPage(id)
  }
}
