# notion-plus

Notion Plus is an Object-Relational Mapping (ORM) library for TypeScript that provides a simple and intuitive way to interact with Notion databases. With Notion Plus, you can define database schemas using TypeScript interfaces, and perform CRUD operations on those databases using a fluent API.
## Features

- Retrieve a database from Notion using the database ID
- Query a page and retrieve its properties and metadata
- Create a new page in the database with specified properties
- Update an existing page in the database with new properties

## Installation

```bash
# Using npm
npm install notion-plus

# Using yarn
yarn add notion-plus

```

## Usage

<!-- MD[CODE_SNIPPET](example/index.ts)[] -->
```ts
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

## The NotionPlus Class

The `NotionPlus` class is the main class in the `notion-plus` library. It provides a wrapper around the Notion API and exposes various methods to interact with Notion databases and pages.

### Constructor

| Parameter | Type     | Required | Description                                                                                                                                                     |
| --------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| token     | `string` | Yes      | Notion API token. Can be obtained from [Notion Integrations](https://developers.notion.com/docs/getting-started#step-2-share-a-database-with-your-integration). |

### Static Methods

| Method                                                | Description                                                                                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getInstance(token: string)`                          | Returns a singleton instance of the `NotionPlus` class using the specified `token` string for authentication.                                                                                                |
| `getModel<T>(databaseId: string, schema?: Schema<T>)` | Returns a `Model` object that can be used to perform CRUD operations on the specified Notion database. Optionally, you can provide a `Schema` object to validate the data when creating or updating records. |

### Examples

#### Creating a new NotionPlus instance

```typescript
import { NotionPlus } from 'notion-plus';

const notionPlus = NotionPlus.getInstance(process.env.NOTION_TOKEN);
```

#### Creating a new Model instance

```typescript
import { NotionPlus, Schema } from 'notion-plus';

interface User {
  'First Name': string;
  'Last Name': string;
  Email: string;
}

const userSchema = new Schema<User>({
  'First Name': 'title',
  'Last Name': 'rich_text',
  Email: 'email',
});

const databaseId = process.env.DB_ID;
const userModel = NotionPlus.getModel<User>(databaseId, userSchema);
```
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

Developer:

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sanyam-arya/) [![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ersanyamarya)
