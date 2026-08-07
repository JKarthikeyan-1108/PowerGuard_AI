class RecommendationEngine:
    def __init__(self):
        # We define heuristic rules mapping cluster IDs to recommendations
        # 0: High peak users, 1: High night users, 2: Heavy overall, 3: Efficient
        self.rules = {
            0: [
                {"title": "Shift Peak Usage", "content": "You use most of your energy during peak hours (6 PM - 9 PM). Try shifting heavy appliances like laundry to off-peak times.", "priority": 1, "estimatedSavings": 15.0}
            ],
            1: [
                {"title": "Optimize Night Heating", "content": "Your night usage is high. Check if heating or cooling systems can be optimized while you sleep.", "priority": 2, "estimatedSavings": 10.0}
            ],
            2: [
                {"title": "Audit Appliances", "content": "Your overall usage is significantly higher than average. Consider an energy audit or replacing old appliances.", "priority": 1, "estimatedSavings": 25.0}
            ],
            3: [
                {"title": "Keep it up!", "content": "You are highly efficient! Consider adding solar to eliminate your remaining bill.", "priority": 3, "estimatedSavings": 0.0}
            ]
        }
        
    def generate_recommendations(self, cluster_id: int):
        return self.rules.get(cluster_id, [])
