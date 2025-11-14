export default defineEventHandler(async (event) => {
  // 這裡可以先測試用假資料
  return {
    articles: [
      { title: "測試新聞一：API 已經跑通", url: "https://example.com/1" },
      { title: "測試新聞二：這是假的新聞資料", url: "https://example.com/2" }
    ]
  }
})
