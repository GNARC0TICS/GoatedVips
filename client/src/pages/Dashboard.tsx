import { AffiliateStats } from "@/components/AffiliateStats";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, logout } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <motion.img 
            src="/goated-logo.png" 
            alt="Goated"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-8"
          />
          <div className="flex items-center gap-4">
            <span className="font-sans">Welcome, {user?.username}</span>
            <Button variant="outline" onClick={() => logout()}>
              SIGN OUT
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-heading font-extrabold uppercase mb-4">Affiliate Dashboard</h1>
          <p className="text-muted-foreground font-sans">Track your referral performance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AffiliateStats />
        </motion.div>
      </main>
    </div>
  );
}