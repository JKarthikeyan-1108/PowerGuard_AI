'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Thermometer, Zap, CheckCircle2, Info } from 'lucide-react';

export default function RecommendationsPage() {
  const recommendations = [
    {
      id: 1,
      category: 'Behavioral',
      title: 'Shift HVAC usage to off-peak hours',
      description: 'Our AI model detected heavy HVAC usage between 5 PM and 8 PM, which coincides with peak tariff rates. By pre-cooling your space before 5 PM or delaying heavy use until after 8 PM, you can significantly reduce costs.',
      potentialSavings: '$18.50/mo',
      icon: Thermometer,
      difficulty: 'Easy',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 2,
      category: 'Appliance',
      title: 'High baseload detected',
      description: 'Your continuous power draw (baseload) is higher than 85% of similar homes. Consider unplugging devices in standby mode or checking for old, inefficient refrigerators.',
      potentialSavings: '$12.00/mo',
      icon: Zap,
      difficulty: 'Medium',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      id: 3,
      category: 'Tariff',
      title: 'Optimal tariff plan available',
      description: 'Based on your usage patterns over the last 3 months, switching to the "Time-of-Use Plus" plan would be more economical than your current flat-rate plan.',
      potentialSavings: '$25.00/mo',
      icon: Lightbulb,
      difficulty: 'Hard',
      color: 'text-energy-500',
      bg: 'bg-energy-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">AI <span className="text-gradient">Recommendations</span></h1>
        <p className="text-muted-foreground mt-1">Personalized insights to help you save energy and reduce costs.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="bg-primary/5 border-primary/20 md:col-span-2">
            <CardContent className="p-6 flex flex-col justify-center h-full">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                     <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Total Potential Savings</p>
                     <h2 className="text-4xl font-bold mt-1 text-primary">$55.50<span className="text-lg text-muted-foreground font-normal"> / month</span></h2>
                  </div>
               </div>
               <p className="text-sm text-muted-foreground mt-4">
                 If you apply all the recommendations below, you could reduce your annual electricity bill by over $600.
               </p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm">Insight Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-3xl font-bold text-success">96%</div>
               <p className="text-xs text-muted-foreground mt-1 mb-4">Confidence score based on 90 days of data.</p>
               <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Our AI continually analyzes your meter data to find inefficiencies.</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight mt-8">Your Action Plan</h3>
        {recommendations.map((rec, i) => (
          <motion.div 
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden hover:border-primary/30 transition-colors">
              <div className="flex flex-col md:flex-row">
                {/* Left icon section */}
                <div className={`p-6 md:w-32 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/50 ${rec.bg}`}>
                  <rec.icon className={`h-8 w-8 mb-2 ${rec.color}`} />
                  <Badge variant="outline" className="bg-background/50 text-[10px] uppercase tracking-wider">{rec.category}</Badge>
                </div>
                
                {/* Content section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-sm font-medium text-muted-foreground">Save up to</p>
                      <p className="text-xl font-bold text-success">{rec.potentialSavings}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Effort: {rec.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-3">
                    <Button variant="default" size="sm" className="gap-2">
                      <CheckCircle2 className="h-4 w-4" /> I'll do this
                    </Button>
                    <Button variant="ghost" size="sm">Dismiss</Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
