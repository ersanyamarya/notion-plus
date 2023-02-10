import {
  GetPagePropertyResponse,
  PageObjectResponse,
  PartialUserObjectResponse,
  QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints'
import { EnumPropertyTypes, Filter, getDatabase, getPageProps } from './client'
import { getDataFromQueryProperty } from './utils'
interface Document {
  id: string
  created_time: string
  last_edited_time: string
  created_by: PartialUserObjectResponse
  last_edited_by: PartialUserObjectResponse
  url: string
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

  find = async ({
    filter,
    pageSize,
    sorts,
  }: {
    filter?: Filter
    pageSize?: number
    sorts?: Array<
      | {
          property: keyof T | keyof Document
          direction: 'ascending' | 'descending'
        }
      | {
          timestamp: 'created_time' | 'last_edited_time'
          direction: 'ascending' | 'descending'
        }
    >
  }): Promise<{
    results: (T & Document)[]
    count: number
    hasMore: boolean
  }> => {
    const response = await getDatabase(this.databaseId, filter, pageSize, sorts as QueryDatabaseParameters['sorts'])

    if (response.results.length > 0) {
      const results = await Promise.all(
        response.results.map(async (page: PageObjectResponse) => {
          const obj: Record<string, any> = {}
          const pageId = page.id
          if (!pageId || typeof pageId !== 'string') return null
          obj.id = page.id
          obj.created_time = page.created_time
          obj.last_edited_time = page.last_edited_time
          obj.created_by = page.created_by
          obj.last_edited_by = page.last_edited_by
          obj.url = page.url

          const dat = Promise.all(
            Object.keys(page.properties).map(async prop => {
              const property = page.properties[prop]
              const res: GetPagePropertyResponse = await getPageProps(pageId, property.id)
              const propType = res.type === 'property_item' ? res.property_item.type : res.type
              return getDataFromQueryProperty[propType](res)
            })
          ).then((values: string[]) => {
            return Object.keys(page.properties).reduce((acc, prop, index) => {
              acc[prop] = values[index]
              return acc
            }, obj)
          })
          return (await dat) as T & Document
        })
      ).then((values: (T & Document)[]) => {
        return values.filter(Boolean)
      })

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
}
