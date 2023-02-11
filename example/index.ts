import { Model, setNotionToken } from 'notiondb'

// Set the token
setNotionToken('secret_UU8a7b4d81-5660-4479-9400-4a7676c6047d')

// Define a database interface
interface User {
  id: string
  name: string
  email: string
  age: number
  admin: boolean
}

// Define a database model
const userModel = new Model<User>(
  {
    id: 'rich_text',
    name: 'rich_text',
    email: 'email',
    age: 'number',
    admin: 'checkbox',
  },
  'f260adfd-2c09-4ee2-bd73-39e94a045d71'
)

// Find all users
const users = await userModel.find({
  pageSize: 2,
  sorts: [
    {
      property: 'name',
      direction: 'ascending',
    },
  ],
  metadata: true,
})

// Print the users
console.dir(users, { depth: null })
