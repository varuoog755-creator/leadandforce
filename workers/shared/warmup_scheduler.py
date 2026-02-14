import os
from datetime import datetime, timedelta

class WarmupScheduler:
    """
    Manages account warm-up routine to avoid bans
    Gradually increases daily action limits over 2 weeks
    """
    
    WARMUP_SCHEDULE = {
        # Week 1: Very conservative
        1: {'connects': 5, 'visits': 10, 'messages': 3},
        2: {'connects': 8, 'visits': 15, 'messages': 5},
        3: {'connects': 10, 'visits': 20, 'messages': 7},
        4: {'connects': 12, 'visits': 25, 'messages': 8},
        5: {'connects': 15, 'visits': 30, 'messages': 10},
        6: {'connects': 18, 'visits': 40, 'messages': 12},
        7: {'connects': 20, 'visits': 50, 'messages': 15},
        
        # Week 2: Gradual increase
        8: {'connects': 22, 'visits': 60, 'messages': 17},
        9: {'connects': 24, 'visits': 70, 'messages': 19},
        10: {'connects': 26, 'visits': 80, 'messages': 21},
        11: {'connects': 28, 'visits': 90, 'messages': 23},
        12: {'connects': 30, 'visits': 95, 'messages': 25},
        13: {'connects': 30, 'visits': 98, 'messages': 27},
        14: {'connects': 30, 'visits': 100, 'messages': 30},
    }
    
    @staticmethod
    def get_daily_limits(warmup_day: int, platform: str = 'linkedin'):
        """
        Get daily action limits based on warmup day
        After day 14, use full limits
        """
        if warmup_day > 14:
            # Full limits after warmup period
            if platform == 'linkedin':
                return {'connects': 30, 'visits': 100, 'messages': 30}
            elif platform == 'instagram':
                return {'follows': 50, 'likes': 150, 'comments': 30}
            elif platform == 'facebook':
                return {'friend_requests': 50, 'group_posts': 10}
        
        # During warmup
        if platform == 'linkedin':
            return WarmupScheduler.WARMUP_SCHEDULE.get(warmup_day, WarmupScheduler.WARMUP_SCHEDULE[1])
        else:
            # Scale down for other platforms
            base_limits = WarmupScheduler.WARMUP_SCHEDULE.get(warmup_day, WarmupScheduler.WARMUP_SCHEDULE[1])
            return {k: int(v * 0.7) for k, v in base_limits.items()}
    
    @staticmethod
    def should_perform_action(current_count: int, action_type: str, warmup_day: int, platform: str = 'linkedin'):
        """
        Check if action should be performed based on current count and limits
        """
        limits = WarmupScheduler.get_daily_limits(warmup_day, platform)
        
        # Map action types to limit keys
        action_map = {
            'connect': 'connects',
            'visit': 'visits',
            'message': 'messages',
            'follow': 'follows',
            'like': 'likes',
            'comment': 'comments',
            'friend_request': 'friend_requests',
            'group_post': 'group_posts'
        }
        
        limit_key = action_map.get(action_type)
        if not limit_key or limit_key not in limits:
            return False
        
        return current_count < limits[limit_key]
