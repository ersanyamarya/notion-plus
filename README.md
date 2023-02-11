# NotionDB

NotionDB is an Object Relational Mapping (ORM) library for Notion databases written in TypeScript. It allows you to interact with your Notion databases in a more familiar and convenient way.

## Features

- Retrieve a database from Notion using the database ID
- Query a page and retrieve its properties and metadata
- Create a new page in the database with specified properties
- Update an existing page in the database with new properties

## Installation

```bash
npm install notiondb
```

## Usage

<!-- MD[CODE_SNIPPET](example/index.ts)[] -->
```ts
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
```
<!-- MD[/CODE_SNIPPET] -->

## The `EnumPropertyTypes` enum (Supported Types)
The following property types are supported:

| Type           | Description                                     |
| -------------- | ----------------------------------------------- |
| `title`        | A title for a page or database item.            |
| `rich_text`    | Formatted text with inline styling.             |
| `checkbox`     | A boolean checkbox.                             |
| `select`       | A single-select dropdown.                       |
| `multi_select` | A multi-select dropdown.                        |
| `number`       | A number value.                                 |
| `date`         | A date or date-time value.                      |
| `string`       | A plain text string.                            |
| `boolean`      | A boolean value.                                |
| `files`        | A file or list of files.                        |
| `email`        | An email address.                               |
| `url`          | A URL.                                          |
| `phone_number` | A phone number.                                 |
| `created_by`   | The user who created the page or database item. |
| `created_time` | The time the page or database item was created. |
| `status`       | The status of a page or database item.          |

## The Model Class

A `Model` class representing a Notion database.

### Properties

The properties of this class are:

| Property   | Type                                | Description                                                                              |
| ---------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| schema     | `Record<string, EnumPropertyTypes>` | The schema of the table. A key-value pair of the column name and the type of the column. |
| databaseId | `string`                            | The ID of the database to be used.                                                       |

### Methods

The methods of this class are:

#### `type(property: string): EnumPropertyTypes`

A type guard. Checks the type of the property.

#### `find({ filter, pageSize, sorts, metadata }): Promise<FIlterResponse<T>>`

Fetches all entries from a database and returns them as an array of objects.

| Parameter  | Type      | Description                                            |
| ---------- | --------- | ------------------------------------------------------ |
| `filter`   | `Filter`  | A filter object to fetch entries from.                 |
| `pageSize` | `number`  | The number of entries to fetch.                        |
| `sorts`    | `Array`   | The order in which to sort the entries.                |
| `metadata` | `boolean` | Whether or not to return meta data about the database. |

Returns an object with the following properties:

| Property  | Type               | Description                                             |
| --------- | ------------------ | ------------------------------------------------------- |
| `results` | `(T & Document)[]` | The results of the query.                               |
| `count`   | `number`           | The total number of entries that match the filter.      |
| `hasMore` | `boolean`          | Indicates whether there are more results to be fetched. |

#### `update(id: string, data: Partial<T>, metaData?: boolean): Promise<T | Record<string, unknown>>`

Updates an existing entry in the database.

| Parameter  | Type         | Description                                            |
| ---------- | ------------ | ------------------------------------------------------ |
| `id`       | `string`     | The ID of the entry to be updated.                     |
| `data`     | `Partial<T>` | The data to be updated.                                |
| `metaData` | `boolean`    | Whether or not to return meta data about the database. |

Returns the updated entry.

#### `create(data: Partial<T>, metaData?: boolean): Promise<T | Record<string, unknown>>`

Creates a new entry in the database.

| Parameter  | Type         | Description                                            |
| ---------- | ------------ | ------------------------------------------------------ |
| `data`     | `Partial<T>` | The data to be inserted.                               |
| `metaData` | `boolean`    | Whether or not to return meta data about the database. |

Returns the newly created entry.

#### `delete(id: string, metaData?: boolean): Promise<T | Record<string, unknown>>`
