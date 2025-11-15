export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare.env.NEWSNOW_DB

  try {
    const { results } = await db.prepare(
      `SELECT id, updated, data 
       FROM cache 
       ORDER BY updated DESC 
       LIMIT 50`
    ).all()

    if (results && results.length > 0) {
      const articles = results.map(r => {
        let parsed: any = {}
        try {
          parsed = JSON.parse(r.data)
        } catch {
          parsed = {}
        }

        return {
          id: r.id, // 來源
          data: {
            title: parsed.title || "無標題",
            extra: parsed.extra || {}
          }
        }
      })

      return { articles }
    }

    return {
      articles: [
        {
          id: "local",
          data: {
            title: "暫無新聞",
            extra: {}
          }
        }
      ]
    }
  } catch (err) {
    return {
      error: true,
      message: "Database query failed",
      details: err.message
    }
  }
})
