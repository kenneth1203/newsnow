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

        // 如果 data 是陣列，取第一筆
        let title = "無標題"
        let extra = {}
        if (Array.isArray(parsed) && parsed.length > 0) {
          title = parsed[0].title || "無標題"
          extra = parsed[0].extra || {}
        } else if (parsed.title) {
          title = parsed.title
          extra = parsed.extra || {}
        }

        return {
          id: r.id,
          data: { title, extra }
        }
      })

      return { articles }
    }

    return {
      articles: [
        {
          id: "local",
          data: {
            title: "暫無新聞，這是測試資料",
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
