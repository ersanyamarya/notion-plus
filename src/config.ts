let notionToken = process.env.NOTION_TOKEN

export const setNotionToken = (token: string) => {
  if (!token) {
    throw new Error('Notion token is not set')
  }
  notionToken = token
}

export const getNotionToken = () => {
  if (!notionToken) {
    throw new Error('Notion token is not set')
  }
  return notionToken
}

export { notionToken }
