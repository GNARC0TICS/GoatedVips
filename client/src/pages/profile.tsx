
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { UserStats } from '@/types';
import { formatWager } from '@/lib/utils';

export default function Profile() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/profile/:id');
  const userId = params?.id;

  const { data: user, isLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/${userId}`],
  });

  if (isLoading) return <LoadingSpinner />;
  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen bg-[${user.profileColor || '#D7FF00'}] text-white`}>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => setLocation("/wager-races")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Races
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold">{user.username}</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Stats</h2>
                <div className="space-y-2">
                  <p>Total Wagered: {formatWager(user.wagered?.all_time || 0)}</p>
                  <p>Monthly Wagered: {formatWager(user.wagered?.this_month || 0)}</p>
                  <p>Weekly Wagered: {formatWager(user.wagered?.this_week || 0)}</p>
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Rankings</h2>
                <div className="space-y-2">
                  <p>All-time Rank: #{user.rankings?.all_time || 'N/A'}</p>
                  <p>Monthly Rank: #{user.rankings?.monthly || 'N/A'}</p>
                  <p>Weekly Rank: #{user.rankings?.weekly || 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
