import { Sparkles, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const PremiumFeatureBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
          <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Premium Feature
            </h3>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
            AI Business Analytics Assistant is an exclusive feature for Premium subscribers. 
            Upgrade now to get in-depth analysis, revenue optimization recommendations, 
            and strategic business consulting from AI.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/payment/packages')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/payment/packages')}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
