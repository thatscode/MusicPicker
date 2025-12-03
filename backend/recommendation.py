import random

def get_recommendations(genre: str = None):
    """
    Mock recommendation service.
    In a real app, this would connect to Spotify/Jamendo API.
    """
    recommendations = [
        {"title": "Morning Breeze", "artist": "Nature Sounds", "genre": "Ambient", "reason": "Gentle start", "url": "https://www.youtube.com/results?search_query=Morning+Breeze+Nature+Sounds"},
        {"title": "Sunrise", "artist": "Acoustic Band", "genre": "Acoustic", "reason": "Positive vibes", "url": "https://www.youtube.com/results?search_query=Sunrise+Acoustic+Band"},
        {"title": "Soft Piano", "artist": "Classical Masters", "genre": "Classical", "reason": "Calming", "url": "https://www.youtube.com/results?search_query=Soft+Piano+Classical+Masters"},
        {"title": "Upbeat Funk", "artist": "Groove Makers", "genre": "Funk", "reason": "Energetic wake up", "url": "https://www.youtube.com/results?search_query=Upbeat+Funk+Groove+Makers"},
        {"title": "Lo-Fi Study", "artist": "Chill Beats", "genre": "Lo-Fi", "reason": "Relaxed rhythm", "url": "https://www.youtube.com/results?search_query=Lo-Fi+Study+Chill+Beats"},
    ]
    
    if genre:
        filtered = [r for r in recommendations if r["genre"].lower() == genre.lower()]
        return filtered if filtered else recommendations
        
    # Return a random selection for variety
    return random.sample(recommendations, 3)
