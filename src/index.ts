import { Client } from '@notionhq/client'
import { Model } from './schema'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function main() {
  const user = new Model<{
    Workspaces: string
    Email: string
    'User Created': boolean
    Reboot: boolean
    'Contact ID': string
    'Last Name': string
    'Company Name': string
    Role: string
    'First Name': string
  }>(
    {
      Workspaces: 'rich_text',
      Email: 'email',
      'User Created': 'checkbox',
      Reboot: 'checkbox',
      'Contact ID': 'rich_text',
      'Last Name': 'rich_text',
      'Company Name': 'rich_text',
      Role: 'select',
      'First Name': 'title',
    },
    'f9a54059cf554ba0a6a6f0238fd05738'
  )
  //   const users = await user.find({
  //     pageSize: 1,
  //     sorts: [
  //       {
  //         property: 'First Name',
  //         direction: 'ascending',
  //       },
  //     ],
  //   })
  //   //   console.log(users.results[0].Email)

  //   console.dir(
  //     users.results.map(user => {
  //       return user['First Name']
  //     }),
  //     { depth: null }
  //   )
}
main()
