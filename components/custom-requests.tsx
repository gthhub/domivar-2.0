import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function CustomRequests() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Custom FX Analysis Requests</h2>
      <p className="text-muted-foreground">
        Submit custom analysis requests to our AI system for specialized FX options trading insights.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>New Custom Request</CardTitle>
          <CardDescription>Describe your FX analysis needs in detail for the most accurate results.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Textarea
              placeholder="Example: Analyze the impact of upcoming ECB meeting on my EUR/USD options position with strike price 1.0850 expiring on June 15th..."
              className="min-h-[150px]"
            />
            <div className="flex justify-end">
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Your previous custom analysis requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex justify-between">
                <h4 className="font-medium">EUR/USD Volatility Analysis</h4>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Analysis of implied volatility patterns for EUR/USD options before ECB monetary policy announcement.
              </p>
            </div>
            <div className="rounded-md border p-4">
              <div className="flex justify-between">
                <h4 className="font-medium">GBP/JPY Risk Reversal Strategy</h4>
                <span className="text-xs text-muted-foreground">1 week ago</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Optimal risk reversal strategy for current GBP/JPY position given upcoming Bank of England meeting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
