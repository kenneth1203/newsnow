export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare.env.NEWSNOW_DB

  const sourceMap: Record<string, { category: string, name: string }> = {
    // === 综合新闻媒体类 ===
    toutiao: { category: "media", name: "今日头条" },
    baidu: { category: "media", name: "百度热搜" },
    thepaper: { category: "media", name: "澎湃新闻" },
    ifeng: { category: "media", name: "凤凰网" },
    cankaoxiaoxi: { category: "media", name: "参考消息" },
    sputniknewscn: { category: "media", name: "卫星通讯社" },
    zaobao: { category: "media", name: "联合早报" },
    mktnews: { category: "media", name: "MKT新闻" },
    kaopu: { category: "media", name: "靠谱新闻" },

    // === 财经投资类 ===
    "wallstreetcn-hot": { category: "finance", name: "华尔街见闻 最热" },
    "wallstreetcn-quick": { category: "finance", name: "华尔街见闻 快讯" },
    "wallstreetcn-news": { category: "finance", name: "华尔街见闻 最新" },
    "cls-hot": { category: "finance", name: "财联社热门" },
    "cls-telegraph": { category: "finance", name: "财联社電報" },
    "cls-depth": { category: "finance", name: "财联社深度" },
    gelonghui: { category: "finance", name: "格隆汇" },
    xueqiu: { category: "finance", name: "雪球" },
    "xueqiu-hotstock": { category: "finance", name: "雪球" },
    jin10: { category: "finance", name: "金十数据" },
    "fastbull-news": { category: "finance", name: "快讯通" },
    "fastbull-express": { category: "finance", name: "快讯通express" },

    // === 社交娱乐类 ===
    weibo: { category: "social", name: "微博" },
    douyin: { category: "social", name: "抖音" },
    "bilibili-hot-search": { category: "social", name: "bilibili 热搜" },
    tieba: { category: "social", name: "贴吧" },
    zhihu: { category: "social", name: "知乎" },
    hupu: { category: "social", name: "虎扑" },
    "chongbuluo-hot": { category: "social", name: "蟲部落" },
    douban: { category: "social", name: "豆瓣" },
    steam: { category: "social", name: "steam" },

    // === 科技类平台 ===
    ithome: { category: "tech", name: "IT之家" },
    juejin: { category: "tech", name: "掘金" },
    github: { category: "tech", name: "GitHub" },
    "github-trending-today": { category: "tech", name: "GitHub" },
    hackernews: { category: "tech", name: "Hacker News" },
    solidot: { category: "tech", name: "Solidot" },
    v2ex: { category: "tech", name: "V2EX" },
    nowcoder: { category: "tech", name: "牛客网" },
    pcbeta: { category: "tech", name: "远景论坛" },
    "pcbeta-windows11": { category: "tech", name: "远景论坛" },
    sspai: { category: "tech", name: "少数派" },
    producthunt: { category: "tech", name: "ProductHunt" }
  }

  // 簡化版分類函式：沒找到就歸到 media
  function resolveSource(id: string) {
    return sourceMap[id] || { category: "media", name: id }
  }

  try {
    const { results } = await db.prepare(
      `SELECT id, updated, data 
       FROM cache 
       ORDER BY updated DESC 
       LIMIT 50`
    ).all()

    const grouped: Record<string, any[]> = { media: [], finance: [], social: [], tech: [] }

    results.forEach(r => {
      let parsed: any = []
      try {
        parsed = JSON.parse(r.data)
      } catch {
        parsed = []
      }

      const sanitize = (str: string) => String(str || "").replace(/[\u0000-\u001F\u007F]/g, "").trim()

      let items: any[] = []
      if (Array.isArray(parsed)) {
        items = parsed.map(item => {
          const obj: any = { title: sanitize(item.title || "無標題") }
          if (item.extra && Object.keys(item.extra).length > 0) obj.extra = item.extra
          return obj
        })
      } else if (parsed.title) {
        const obj: any = { title: sanitize(parsed.title) }
        if (parsed.extra && Object.keys(parsed.extra).length > 0) obj.extra = parsed.extra
        items = [obj]
      }

      const { category, name } = resolveSource(r.id)
      grouped[category].push({ id: r.id, name, data: items })
    })

    return grouped
  } catch (err: any) {
    return { error: true, message: "Database query failed", details: err.message }
  }
})
