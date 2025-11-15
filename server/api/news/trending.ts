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
        let parsed: any = []
        try {
          parsed = JSON.parse(r.data)
        } catch {
          parsed = []
        }

        // 如果 data 是陣列，展開所有 title + extra
        let items = []
        if (Array.isArray(parsed)) {
          items = parsed.map(item => ({
            title: item.title || "無標題",
            extra: item.extra || {}
          }))
        } else if (parsed.title) {
          items = [{
            title: parsed.title,
            extra: parsed.extra || {}
          }]
        }

        return {
          id: r.id,
          data: items
        }
      })

      return { articles }
    }

    return {
      articles: [
        {
          id: "local",
          data: [
            {
              title: "暫無新聞",
              extra: {}
            }
          ]
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
