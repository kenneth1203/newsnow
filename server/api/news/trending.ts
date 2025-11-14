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
      // 把 data 欄位解析成 JSON
      const articles = results.flatMap(r => {
        let parsed: any[] = []
        try {
          parsed = JSON.parse(r.data)   // 這裡是關鍵
        } catch {
          parsed = [{ title: "資料解析失敗", raw: r.data }]
        }
        return parsed.map(item => ({
          id: r.id,
          updated: r.updated,
          ...item
        }))
      })

      // 確保回傳 JSON + UTF-8
      event.node.res.setHeader("Content-Type", "application/json; charset=utf-8")
      return { articles }
    }

    return {
      articles: [
        {
          title: "暫無新聞，這是測試資料",
          url: "https://example.com/test",
          source: "local",
          time: new Date().toISOString()
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
