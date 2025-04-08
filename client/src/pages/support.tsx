import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-[#8A8B91] mb-6">
              Need help? Contact our VIP support team on Telegram:
            </p>
            <a 
              href="https://t.me/xGoombas" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button
                variant="default"
                className="w-full bg-[#D7FF00] text-[#14151A] hover:bg-[#D7FF00]/90"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message @xGoombas
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
