import { UserObjectResponse } from '@notionhq/client/build/src/api-endpoints'

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
  | 'unique_id'

export type NotionRecord = {
  id: string
  created_time: string
  last_edited_time: string
  created_by: UserObjectResponse
  last_edited_by: UserObjectResponse
  url: string
}

export type NotionSchema<T> = {
  [P in keyof T]: EnumPropertyTypes
}

export class Schema<T> {
  readonly notionSchema: NotionSchema<T & NotionRecord>

  constructor(notionSchema: NotionSchema<T>) {
    this.notionSchema = {
      ...notionSchema,
      id: 'string',
      created_time: 'created_time',
      last_edited_time: 'created_time',
      created_by: 'created_by',
      last_edited_by: 'created_by',
      url: 'url',
    }
  }
}
