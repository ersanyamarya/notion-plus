import { NotionPlus, Schema } from 'notion-plus'

const notionPlus = NotionPlus.getInstance(process.env.NOTION_TOKEN)
const databaseId = process.env.DB_ID

interface User {
  'First Name': string
  'Last Name': string
  Email: string
  'Company Name': string
}

const userSchema = new Schema<User>({
  'First Name': 'title',
  'Last Name': 'rich_text',
  Email: 'email',
  'Company Name': 'rich_text',
})

const userModel = notionPlus.getModel<User>(databaseId, userSchema)

// new Model<User>(notion, databaseId, userSchema)

const main = async () => {
  const users = await userModel.find({
    pageSize: 1,
    sorts: [
      {
        property: 'First Name',
        direction: 'ascending',
      },
    ],
    filter: {
      property: 'First Name',
      title: {
        contains: 'John',
      },
    },
    // metadata: true,
  })
  console.log(users)
}
main()
