import {
  BotUserObjectResponse,
  CreatedByPropertyItemObjectResponse,
  DatePropertyItemObjectResponse,
  FilesPropertyItemObjectResponse,
  MultiSelectPropertyItemObjectResponse,
  NumberPropertyItemObjectResponse,
  PageObjectResponse,
  PersonUserObjectResponse,
  PropertyItemObjectResponse,
  RichTextPropertyItemObjectResponse,
  SelectPropertyItemObjectResponse,
  StatusPropertyItemObjectResponse,
  TitlePropertyItemObjectResponse,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { EnumPropertyTypes } from './schema'

/* It's a map of all the different types of properties that Notion has, and the function that will
parse them into their correct types. */
export const parseNotionParams: Record<EnumPropertyTypes, (propertyItem: PropertyItemObjectResponse) => unknown> = {
  title: (propertyItem: TitlePropertyItemObjectResponse) => propertyItem.title[0]?.plain_text,
  rich_text: (propertyItem: RichTextPropertyItemObjectResponse) => propertyItem.rich_text[0]?.plain_text,
  ...['number', 'checkbox', 'date', 'string', 'boolean', 'email', 'url', 'phone_number', 'created_time'].reduce(
    (acc, type) => {
      acc[type] = (propertyItem: NumberPropertyItemObjectResponse) => propertyItem[type]
      return acc
    },
    {} as Record<EnumPropertyTypes, (propertyItem: PropertyItemObjectResponse) => unknown>
  ),
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
  files: (propertyItem: FilesPropertyItemObjectResponse) => {
    const file = propertyItem.files[0]
    return file.type === 'external' ? file.external.url : file.file.url
  },
}

/* It's a map of all the different types of properties that Notion has, and the function that will
parse them into their correct types. */
export const getNotionPropertyFromData: Record<
  EnumPropertyTypes,
  (value: unknown, header: string) => PageObjectResponse['properties']
> = {
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
  multi_select: (value: any, property) => ({
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
  files: (value, property) => ({
    [property]: {
      name: value,
      type: 'external',
      external: {
        url: value,
      },
    },
  }),

  ...['number', 'checkbox', 'date', 'string', 'boolean', 'email', 'url', 'phone_number', 'created_time'].reduce(
    (acc, type) => {
      acc[type] = (value, property) => ({
        [property]: {
          [type]: value,
        },
      })
      return acc
    },
    {} as Record<EnumPropertyTypes, (value: unknown, property: string) => PageObjectResponse['properties']>
  ),
}

/**
 * It takes in a PageObjectResponse and returns a new object with the same properties, but with the
 * values parsed into their correct types
 * @param {PageObjectResponse} updatedUser - PageObjectResponse
 * @param [metaData=false] - boolean - whether or not to include the metadata of the page
 */
export const prettyDbData = <T>(updatedUser: PageObjectResponse, metaData = false): T => {
  const data = Object.keys(updatedUser.properties).reduce(
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
  return data
}
