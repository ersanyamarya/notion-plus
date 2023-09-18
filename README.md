# Notion Plus

Notion Plus is an Object-Relational Mapping (ORM) library for TypeScript that provides a simple and intuitive way to interact with Notion databases. With Notion Plus, you can define database schemas using TypeScript interfaces, and perform CRUD operations on those databases using a fluent API.
## Features

- Retrieve a database from Notion using the database ID
- Query a page and retrieve its properties and metadata
- Create a new page in the database with specified properties
- Update an existing page in the database with new properties
- Archive an existing page in the database

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
| `files`        | A file url.                                     |
| `email`        | An email address.                               |
| `url`          | A URL.                                          |
| `phone_number` | A phone number.                                 |
| `created_by`   | The user who created the page or database item. |
| `created_time` | The time the page or database item was created. |
| `status`       | The status of a page or database item.          |
| `unique_id`    | A unique id for database.                       |

---
## The `NotionPlus` Class

The `NotionPlus` class is the main class in the `notion-plus` library. It provides a wrapper around the Notion API and exposes various methods to interact with Notion databases and pages.

### Creating a new NotionPlus instance

```typescript
import { NotionPlus } from 'notion-plus';

const notionPlus = NotionPlus.getInstance(process.env.NOTION_TOKEN);
```
### Constructor

Creates a new instance of the `NotionPlus` class.

| Name        | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| notionToken | `string` | The API key for your Notion integration. |

Since the `NotionPlus` class is a singleton, you should use the `getInstance()` method to create a new instance.

### Methods

#### `getModel<T>(databaseId: string, schema: Schema<T>): Model<T>`

Returns a `Model<T>` instance for the specified database ID and schema. If a `Model<T>` instance for the specified database ID and schema has already been created, it returns the existing instance.

| Name       | Type     | Description                        |
| ---------- | -------- | ---------------------------------- |
| databaseId | `string` | The ID of the Notion database.     |
| schema     | `Schema` | The schema of the Notion database. |

#### `getNotionClient(): Client`

Returns the `Client` instance used by the `NotionPlus` class.

#### `getDatabases(databaseId: string, filter?: QueryDatabaseParameters['filter'], pageSize?: number, sorts: QueryDatabaseParameters['sorts'] = []): Promise<QueryDatabaseResponse>`

Queries a Notion database for its properties and returns the results.

| Name       | Type                                                         | Description                             |
| ---------- | ------------------------------------------------------------ | --------------------------------------- |
| databaseId | `string`                                                     | The ID of the Notion database to query. |
| filter     | `QueryDatabaseParameters['filter']` (optional)               | The filter to apply to the query.       |
| pageSize   | `number` (optional)                                          | The number of items to return per page. |
| sorts      | `QueryDatabaseParameters['sorts']` (optional, default: `[]`) | The sorting criteria for the query.     |

#### `getPageProps(pageId: string, propertyId: string): Promise<GetPagePropertyResponse>`

Retrieves the specified property value for a Notion page.

| Name       | Type     | Description                         |
| ---------- | -------- | ----------------------------------- |
| pageId     | `string` | The ID of the Notion page.          |
| propertyId | `string` | The ID of the property to retrieve. |

#### `updateNotionPage(pageId: string, properties: UpdatePageParameters['properties']): Promise<UpdatePageResponse>`

Updates the properties of a Notion page.

| Name       | Type                                 | Description                                       |
| ---------- | ------------------------------------ | ------------------------------------------------- |
| pageId     | `string`                             | The ID of the Notion page.                        |
| properties | `UpdatePageParameters['properties']` | An object containing the updated page properties. |

#### `createNotionPage(databaseId: string, properties: CreatePageParameters['properties']): Promise<CreatePageResponse>`

Creates a new Notion page in the specified database.

| Name       | Type                                                                        | Description                               |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| databaseId | `string`                                                                    | The ID of the Notion database.            |
| properties | `CreatePageParameters['properties']` (must include all required properties) | An object containing the page properties. |


#### `archiveNotionPage(pageId: string): Promise<ArchivePageResponse>`

Archives a Notion page.

| Name   | Type     | Description         |
| ------ | -------- | ------------------- |
| pageId | `string` | The ID of the page. |

---

## The `Schema` Class

| Name                                           | Description                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `notionSchema: NotionSchema<T & NotionRecord>` | The notion schema for the Notion database.                         |
| `constructor(notionSchema: NotionSchema<T>)`   | Creates a new `Schema` instance with the specified `notionSchema`. |

The Schema class is a simple class with a single property notionSchema of type `NotionSchema<T & NotionRecord>`, and a constructor that initializes this property. The NotionSchema type is a mapped type that maps the keys of T to EnumPropertyTypes.

The Schema class is used in the NotionPlus class to define the schema for a Notion database

### Creating a new Schema instance

```typescript
import { Schema } from 'notion-plus';

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
```

---


## The `Model<T>` Class
A class representing a Notion database model with typed properties.

### Constructor

| Parameter    | Type         | Description                                                                         |
| ------------ | ------------ | ----------------------------------------------------------------------------------- |
| `notionPlus` | `NotionPlus` | An instance of `NotionPlus` class used to communicate with Notion API.              |
| `databaseId` | `string`     | The ID of the Notion database.                                                      |
| `schema`     | `Schema<T>`  | An instance of `Schema` class representing the typed schema of the Notion database. |

### Methods

| Method    | Parameters                                       | Return value                 | Description                                          |
| --------- | ------------------------------------------------ | ---------------------------- | ---------------------------------------------------- |
| `find`    | `{ filter?, pageSize?, sorts?, metadata? }`      | `Promise<FilterResponse<T>>` | Finds and returns a filtered list of database items. |
| `create`  | `item: Partial<T>, metaData = false`             | `Promise<T & NotionRecord>`  | Creates a new item in the database.                  |
| `update`  | `id: string, data: Partial<T>, metaData = false` | `Promise<T & NotionRecord>`  | Updates an existing item in the database.            |
| `archive` | `id: string, metaData = false`                   | `Promise<T & NotionRecord>`  | Archives an existing item in the database.           |


#### `archive(id: string, metaData?: boolean): Promise<T | Record<string, unknown>>`

Developer:

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sanyam-arya/) [![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ersanyamarya)
