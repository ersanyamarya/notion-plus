import {
  CreatedByPropertyItemObjectResponse,
  DatePropertyItemObjectResponse,
  GetPagePropertyResponse,
  MultiSelectPropertyItemObjectResponse,
  NumberPropertyItemObjectResponse,
  PropertyItemObjectResponse,
  RichTextPropertyItemObjectResponse,
  SelectPropertyItemObjectResponse,
  StatusPropertyItemObjectResponse,
  TitlePropertyItemObjectResponse,
  UserObjectResponse,
  PersonUserObjectResponse,
  BotUserObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { EnumPropertyTypes } from './client'

export const parseNotionParams: Record<EnumPropertyTypes, (propertyItem: PropertyItemObjectResponse) => any> = {
  title: (propertyItem: TitlePropertyItemObjectResponse) => propertyItem.title[0]?.plain_text,
  rich_text: (propertyItem: RichTextPropertyItemObjectResponse) => propertyItem.rich_text[0]?.plain_text,
  ...[
    'number',
    'files',
    'checkbox',
    'date',
    'string',
    'boolean',
    'email',
    'url',
    'phone_number',
    'created_time',
  ].reduce((acc, type) => {
    acc[type] = (propertyItem: NumberPropertyItemObjectResponse) => propertyItem[type]
    return acc
  }, {} as Record<EnumPropertyTypes, (propertyItem: PropertyItemObjectResponse) => any>),
  select: (propertyItem: SelectPropertyItemObjectResponse) => (propertyItem.select ? propertyItem.select.name : ''),
  status: (propertyItem: StatusPropertyItemObjectResponse) => (propertyItem.status ? propertyItem.status.name : ''),
  multi_select: (propertyItem: MultiSelectPropertyItemObjectResponse) =>
    propertyItem.multi_select.map((item: any) => item.name),
  created_by: (propertyItem: CreatedByPropertyItemObjectResponse) => {
    const createdAt: UserObjectResponse = propertyItem.created_by as UserObjectResponse
    // Check if the user is a person or a bot
    if (createdAt.type === 'person') {
      const person: PersonUserObjectResponse = createdAt as PersonUserObjectResponse
      return person.person.email
    }
    const bot: UserObjectResponse = createdAt as BotUserObjectResponse
    return bot.bot.owner
  },
  date: (propertyItem: DatePropertyItemObjectResponse) => propertyItem.date,
}

export const getMutatePropertyFromData: Record<EnumPropertyTypes, (value: any, header: string) => Record<string, any>> =
  {
    title: (value, property) => ({
      [property]: {
        title: [
          {
            text: {
              content: value,
            },
          },
        ],
      },
    }),
    rich_text: (value, property) => ({
      [property]: {
        rich_text: [
          {
            text: {
              content: value,
            },
          },
        ],
      },
    }),
    select: (value, property) => ({
      [property]: {
        select: {
          name: value,
        },
      },
    }),
    status: (value, property) => ({
      [property]: {
        status: {
          name: value,
        },
      },
    }),
    multi_select: (value, property) => ({
      [property]: {
        multi_select: value.map(item => ({
          name: item,
        })),
      },
    }),
    date: (value, property) => ({
      [property]: {
        date: value,
      },
    }),

    ...[
      'number',
      'files',
      'checkbox',
      'date',
      'string',
      'boolean',
      'email',
      'url',
      'phone_number',
      'created_time',
    ].reduce((acc, type) => {
      acc[type] = (value, property) => ({
        [property]: {
          [type]: value,
        },
      })
      return acc
    }, {} as Record<EnumPropertyTypes, (value: any, property: string) => Record<string, any>>),
  }

export const prettyDbData = <T>(updatedUser: PageObjectResponse, metaData = false): T =>
  Object.keys(updatedUser.properties).reduce(
    (acc, prop) => {
      const property = updatedUser.properties[prop]
      return {
        ...acc,
        [prop]: parseNotionParams[property.type](property),
      }
    },
    metaData
      ? ({
          id: updatedUser.id,
          created_time: updatedUser.created_time,
          last_edited_time: updatedUser.last_edited_time,
          created_by: updatedUser.created_by,
          last_edited_by: updatedUser.last_edited_by,
          url: updatedUser.url,
        } as T)
      : ({} as T)
  )
