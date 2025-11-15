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

        // 清理字串中可能破壞 JSON 的符號
        const sanitize = (str: string) =>
          str.replace(/[\u0000-\u001F\u007F]/g, "").trim()

        // 如果 data 是陣列，展開所有 title + extra
        let items: any[] = []
        if (Array.isArray(parsed)) {
          items = parsed.map(item => {
            const obj: any = { title: sanitize(item.title || "無標題") }
            if (item.extra && Object.keys(item.extra).length > 0) {
              obj.extra = item.extra
            }
            return obj
          })
        } else if (parsed.title) {
          const obj: any = { title: sanitize(parsed.title) }
          if (parsed.extra && Object.keys(parsed.extra).length > 0) {
            obj.extra = parsed.extra
          }
          items = [obj]
        }

        return {
          id: r.id,
          data: items
        }
      })

      // 直接輸出陣列，不包 articles
      return articles
    }

    // 沒有資料時，直接輸出一筆假資料
    return [
      {
        id: "local",
        data: [
          {
            title: "暫無新聞"
          }
        ]
      }
    ]
  } catch (err: any) {
    return {
      error: true,
      message: "Database query failed",
      details: err.message
    }
  }
})
