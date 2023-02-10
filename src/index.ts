import { Model } from './schema'

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
  const users = await user.find({
    pageSize: 2,
    sorts: [
      {
        property: 'First Name',
        direction: 'ascending',
      },
    ],
    metadata: true,
  })
  //   console.log(users.results[0].Email)

  console.dir(
    users.results.map(user => {
      //   return {
      //     name: `${user['First Name']} ${user['Last Name']}`,
      //     email: user.Email,
      //     role: user.Role,
      //     selected: user['User Created'],
      //   }
      return user
    }),
    { depth: null }
  )
  //   const upUser = await user.update('faef876abeeb4d1db6f99c92a5facb84', {
  //     'First Name': 'Manikandan',
  //     'Last Name': 'Krishnan',
  //     Role: 'Admin',
  //   })
  //   console.dir(
  //     {
  //       upUser,
  //     },
  //     { depth: null }
  //   )

  //   const upUser = await user.create({
  //     'First Name': 'dasdasdas',
  //     'Last Name': 'Krissadsadsadhnan',
  //     Role: 'Admin',
  //   })
  //   console.dir(
  //     {
  //       upUser,
  //     },
  //     { depth: null }
  //   )
}
main()
