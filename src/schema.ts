import {
  CreatePageParameters,
  PageObjectResponse,
  QueryDatabaseParameters,
  UpdatePageParameters,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { createNotionPage, EnumPropertyTypes, Filter, getDatabase, updateNotionPage } from './client'
import { getMutatePropertyFromData, prettyDbData } from './utils'
interface Document {
  id: string
  created_time: string
  last_edited_time: string
  created_by: UserObjectResponse
  last_edited_by: UserObjectResponse
  url: string
}
type FindArguments<T> = {
  filter?: Filter
  pageSize?: number
  sorts?: Array<
    | {
        property: keyof (T & Document)
        direction: 'ascending' | 'descending'
      }
    | {
        timestamp: 'created_time' | 'last_edited_time'
        direction: 'ascending' | 'descending'
      }
  >
  metadata?: boolean
}

type FIlterResponse<T> = {
  results: (T & Document)[]
  count: number
  hasMore: boolean
}

export class Model<T> {
  schema: Record<string, EnumPropertyTypes>
  databaseId: string

  constructor(schema: Record<string, EnumPropertyTypes>, databaseId: string) {
    this.schema = {
      ...schema,
      id: 'string',
      created_time: 'created_time',
      last_edited_time: 'created_time',
      created_by: 'created_by',
      last_edited_by: 'created_by',
      url: 'url',
    }
    this.databaseId = databaseId
  }

  type = (property: string): EnumPropertyTypes => {
    return this.schema[property]
  }

  find = async ({ filter, pageSize, sorts, metadata }: FindArguments<T>): Promise<FIlterResponse<T>> => {
    const response = await getDatabase(this.databaseId, filter, pageSize, sorts as QueryDatabaseParameters['sorts'])

    if (response.results.length > 0) {
      const results = response.results.map((result: PageObjectResponse) => prettyDbData<T & Document>(result, metadata))

      return {
        results,
        hasMore: response.has_more,
        count: results.length,
      }
    }

    return {
      results: [],
      count: 0,
      hasMore: false,
    }
  }

  update = async (id: string, data: Partial<T>, metaData = false) => {
    const updateProp: UpdatePageParameters['properties'] = Object.keys(data).reduce((acc, prop) => {
      try {
        acc = {
          ...acc,
          ...getMutatePropertyFromData[this.type(prop)](data[prop], prop),
        }
      } catch (error) {
        console.log(error)
      }
      return acc
    }, {})
    const updatedUser = (await updateNotionPage(id, updateProp)) as PageObjectResponse
    return prettyDbData(updatedUser, metaData)
  }

  create = async (data: Partial<T>, metaData = false) => {
    const createProps: CreatePageParameters['properties'] = Object.keys(data).reduce((acc, prop) => {
      try {
        acc = {
          ...acc,
          ...getMutatePropertyFromData[this.type(prop)](data[prop], prop),
        }
      } catch (error) {
        console.log(error)
      }
      return acc
    }, {})
    const createdUser = (await createNotionPage(this.databaseId, createProps)) as PageObjectResponse
    return prettyDbData(createdUser, metaData)
  }
}
