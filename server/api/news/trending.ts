export default defineEventHandler(async (event) => {
  // 使用你在 wrangler.toml 裡設定的 binding 名稱
  const db = event.context.cloudflare.env.NEWSNOW_DB

  try {
    // 查詢最新 10 筆新聞快取
    const { results } = await db.prepare(
      `SELECT title, url, source, time 
       FROM cache 
       ORDER BY time DESC 
       LIMIT 50`
    ).all()

    if (results && results.length > 0) {
      return { articles: results }
    }

    // 如果 DB 沒有資料，回傳假資料
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
