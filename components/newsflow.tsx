import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the types of asset keys
type AssetKey = {
  id: string
  name: string
  shape: "circle" | "square" | "triangle" | "diamond"
  color: string
}

// Define the news article type
type NewsArticle = {
  id: string
  title: string
  source: string
  publishedAt: string
  url: string
  relevantAssets: string[] // IDs of relevant assets
}

// Asset keys definition - only currency pairs
const assetKeys: AssetKey[] = [
  { id: "eurusd", name: "EUR/USD", shape: "circle", color: "bg-emerald-500" },
  { id: "usdjpy", name: "USD/JPY", shape: "square", color: "bg-red-500" },
  { id: "gbpusd", name: "GBP/USD", shape: "triangle", color: "bg-blue-500" },
  { id: "audusd", name: "AUD/USD", shape: "diamond", color: "bg-amber-500" },
  { id: "usdcad", name: "USD/CAD", shape: "circle", color: "bg-purple-500" },
  { id: "eurgbp", name: "EUR/GBP", shape: "square", color: "bg-indigo-500" },
  { id: "nzdusd", name: "NZD/USD", shape: "triangle", color: "bg-green-500" },
  { id: "usdchf", name: "USD/CHF", shape: "diamond", color: "bg-pink-500" },
]

// Sample news articles with updated relevant assets
const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "ECB's Lagarde signals June rate cut, markets price in multiple reductions",
    source: "Reuters",
    publishedAt: "2023-05-13T14:32:00Z",
    url: "#",
    relevantAssets: ["eurusd", "eurgbp"], // ECB affects EUR pairs
  },
  {
    id: "2",
    title: "Bank of Japan maintains ultra-loose policy, yen weakens against dollar",
    source: "Financial Times",
    publishedAt: "2023-05-13T09:15:00Z",
    url: "#",
    relevantAssets: ["usdjpy"], // BoJ affects JPY pairs
  },
  {
    id: "3",
    title: "US inflation cools more than expected in April, boosting Fed rate cut bets",
    source: "Bloomberg",
    publishedAt: "2023-05-12T16:45:00Z",
    url: "#",
    relevantAssets: ["eurusd", "usdjpy", "gbpusd", "audusd", "usdcad", "usdchf"], // Fed affects all USD pairs
  },
  {
    id: "4",
    title: "Australian dollar rallies as RBA hints at potential rate hike",
    source: "CNBC",
    publishedAt: "2023-05-12T08:20:00Z",
    url: "#",
    relevantAssets: ["audusd"],
  },
  {
    id: "5",
    title: "EUR/USD technical analysis suggests potential breakout above 1.0900",
    source: "FX Street",
    publishedAt: "2023-05-11T15:10:00Z",
    url: "#",
    relevantAssets: ["eurusd"],
  },
  {
    id: "6",
    title: "Fed's Powell reiterates data-dependent approach to monetary policy",
    source: "Wall Street Journal",
    publishedAt: "2023-05-11T12:30:00Z",
    url: "#",
    relevantAssets: ["eurusd", "usdjpy", "gbpusd", "audusd", "usdcad", "usdchf", "nzdusd"], // Fed affects all USD pairs
  },
  {
    id: "7",
    title: "ECB officials divided on pace of rate cuts amid persistent inflation",
    source: "Bloomberg",
    publishedAt: "2023-05-10T14:45:00Z",
    url: "#",
    relevantAssets: ["eurusd", "eurgbp"], // ECB affects EUR pairs
  },
  {
    id: "8",
    title: "USD/CAD falls as oil prices surge on supply concerns",
    source: "Reuters",
    publishedAt: "2023-05-10T10:20:00Z",
    url: "#",
    relevantAssets: ["usdcad"],
  },
  {
    id: "9",
    title: "Bank of Japan deputy governor hints at potential YCC adjustment",
    source: "Nikkei",
    publishedAt: "2023-05-09T07:15:00Z",
    url: "#",
    relevantAssets: ["usdjpy"], // BoJ affects JPY pairs
  },
  {
    id: "10",
    title: "UK GDP growth beats expectations, pound sterling strengthens",
    source: "Financial Times",
    publishedAt: "2023-05-09T09:30:00Z",
    url: "#",
    relevantAssets: ["gbpusd", "eurgbp"], // UK data affects GBP pairs
  },
]

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}

// Consistent asset key indicator component
function AssetKeyIndicator({ assetId }: { assetId: string }) {
  const asset = assetKeys.find((a) => a.id === assetId)
  if (!asset) return null

  // Consistent shape rendering
  let shapeClasses = ""

  switch (asset.shape) {
    case "circle":
      shapeClasses = `${asset.color} h-3 w-3 rounded-full`
      break
    case "square":
      shapeClasses = `${asset.color} h-3 w-3`
      break
    case "triangle":
      shapeClasses = `${asset.color} h-3 w-3 transform rotate-45`
      break
    case "diamond":
      shapeClasses = `${asset.color} h-3 w-3 transform rotate-45`
      break
  }

  return <div className={`${shapeClasses}`} title={asset.name} />
}

export default function Newsflow() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Newsflow</h2>
          <p className="text-muted-foreground">AI-curated news articles relevant to your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {assetKeys.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="market">Market News</TabsTrigger>
          <TabsTrigger value="central-banks">Central Banks</TabsTrigger>
          <TabsTrigger value="economic">Economic Data</TabsTrigger>
          <TabsTrigger value="geopolitical">Geopolitical</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Asset Key</h3>
            </div>
            <div className="flex flex-wrap gap-3 rounded-md border p-2">
              {assetKeys.map((asset) => (
                <div key={asset.id} className="flex items-center gap-1.5">
                  <AssetKeyIndicator assetId={asset.id} />
                  <span className="text-xs">{asset.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {newsArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden">
                <div className="flex">
                  <div className="flex-shrink-0 w-1 bg-primary"></div>
                  <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{article.title}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">{article.source}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-4 flex-shrink-0">
                        {article.relevantAssets.map((assetId) => (
                          <AssetKeyIndicator key={assetId} assetId={assetId} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <p className="text-muted-foreground">Market-specific news filtered here.</p>
        </TabsContent>

        <TabsContent value="central-banks" className="space-y-4">
          <p className="text-muted-foreground">Central bank news filtered here.</p>
        </TabsContent>

        <TabsContent value="economic" className="space-y-4">
          <p className="text-muted-foreground">Economic data news filtered here.</p>
        </TabsContent>

        <TabsContent value="geopolitical" className="space-y-4">
          <p className="text-muted-foreground">Geopolitical news and events that may impact currency markets.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
