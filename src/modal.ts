import {
  CreatePageParameters,
  PageObjectResponse,
  QueryDatabaseParameters,
  UpdatePageParameters,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { createNotionPage, EnumPropertyTypes, Filter, getDatabase, updateNotionPage } from './client'
import { getMutatePropertyFromData, prettyDbData } from './utils'

/* An interface that is used to extend the type of the data that is returned from the database. */
export type Document = {
  id: string
  created_time: string
  last_edited_time: string
  created_by: UserObjectResponse
  last_edited_by: UserObjectResponse
  url: string
}

/**
 * `FindArguments` is a type that represents the arguments that can be passed to the `find` method of a
 * collection.
 *
 * The `FindArguments` type is a generic type, which means that it can be used to represent the
 * arguments for any collection. The generic type parameter `T` represents the type of the documents in
 * the collection.
 *
 * The `FindArguments` type is an object type, which means that it represents an object with
 * properties. The properties of the `FindArguments` type are:
 *
 * - `filter`: a filter object that can
 * @property {Filter} filter - A filter object that specifies the documents to return.
 * @property {number} pageSize - The number of documents to return.
 * @property sorts - An array of objects that specify the sort order of the results. Each object can
 * have two properties:
 * @property {boolean} metadata - If true, the response will include the total number of documents that
 * match the query, and the total number of pages.
 */
export type FindArguments<T> = {
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

/**
 * A filter response is an object with a results property that is an array of documents, a count
 * property that is a number, and a hasMore property that is a boolean.
 * @property {(T & Document)[]} results - The results of the query.
 * @property {number} count - The total number of documents that match the filter.
 * @property {boolean} hasMore - This is a boolean property that indicates whether there are more
 * results to be fetched.
 */
export type FIlterResponse<T> = {
  results: (T & Document)[]
  count: number
  hasMore: boolean
}

export class Model<T> {
  schema: Record<string, EnumPropertyTypes>
  databaseId: string

  /**
   * It takes a schema and a database ID, and returns a new instance of the class
   * @param schema - This is the schema of the table. It's a key-value pair of the column name and the
   * type of the column.
   * @param {string} databaseId - The ID of the database you want to use.
   */
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

  /* A type guard. It is checking the type of the property. */
  type = (property: string): EnumPropertyTypes => {
    return this.schema[property]
  }

  /**
   * Fetches all documents from a database and returns them as an array of objects.
   * @param databaseId - The ID of the database to fetch documents from.
   * @param filter - A filter object to fetch documents from.
   * @param pageSize - The number of documents to fetch.
   * @param sorts - The order in which to sort the documents.
   */

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

  /**
   * Adds a user to the database
   * @param {string} id - the id of the user to be updated
   * @param {Partial<T>} data - the data to be updated
   * @param {boolean} metaData - whether or not to return meta data about the database
   * @returns {Promise<T | Record<string, unknown>>} - the updated user
   */

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

  /**
   * It creates a new page in the database
   * @param {Partial<T>} data - Data to create the page with
   * @param {boolean} metaData - Whether to return the meta data or not
   * @returns {Promise<Page>} - The created page
   */
  create = async (data: Partial<T>, metaData = false) => {
    const createProps: CreatePageParameters['properties'] = Object.keys(data).reduce((acc, prop) => {
      acc = {
        ...acc,
        ...getMutatePropertyFromData[this.type(prop)](data[prop], prop),
      }

      return acc
    }, {})
    const createdUser = (await createNotionPage(this.databaseId, createProps)) as PageObjectResponse
    return prettyDbData(createdUser, metaData)
  }
}
