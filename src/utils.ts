import { GetPagePropertyResponse } from '@notionhq/client/build/src/api-endpoints'
import { EnumPropertyTypes } from './client'

export const getDataFromQueryProperty: Record<EnumPropertyTypes, (res: GetPagePropertyResponse) => any> = {
  title: (res: any) => res.results[0]?.title?.plain_text,
  rich_text: (res: any) => res.results[0]?.rich_text?.plain_text,

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
    acc[type] = (res: any) => res[type]
    return acc
  }, {} as Record<EnumPropertyTypes, (res: any) => any>),

  select: (res: any) => (res.select ? res.select.name : ''),
  status: (res: any) => (res.status ? res.status.name : ''),
  multi_select: (res: any) => res.multi_select.map((item: any) => item.name),
  created_by: (res: any) => res.created_by.person.email,
  date: (res: any) => res.date,
}
