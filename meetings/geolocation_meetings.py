# geolocation_meetings.py

import math

# For this implementation, we set the user_id to 1 by default.
from users_data import get_user_geolocation_consent, request_user_geolocation_consent, set_user_geolocation_consent

from users_data import get_user_geolocation_consent, request_user_geolocation_consent


class User:
    def __init__(self, user_id, name, latitude, longitude):
        self.user_id = user_id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude


def calculate_distance(user1, user2):
    """
    Calculates the distance between two users using the Haversine formula.
    """
    R = 6371  # Radius of the Earth in kilometers
    lat1, lon1 = math.radians(user1.latitude), math.radians(user1.longitude)
    lat2, lon2 = math.radians(user2.latitude), math.radians(user2.longitude)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance


def find_users_within_radius(target_user, users, radius):
    """
    Finds users within a specified radius of a target user.
    """
    users_within_radius = []
    for user in users:
        if user.user_id != target_user.user_id and calculate_distance(target_user, user) <= radius:
            users_within_radius.append(user)
    return users_within_radius


def save_user_geolocation(user_id, latitude, longitude):
    """Saves or updates the geolocation of a user."""
    # Check if the user has granted consent, request it if not already granted.
    if not get_user_geolocation_consent(user_id):
        if not request_user_geolocation_consent(user_id):
            print(f"Warning: User {user_id} has not granted geolocation consent. Location not saved.")
            return False

    # In a real application, this would involve updating a database.
    # Here, we'll just print a message.
    print(f"Updating geolocation for user {user_id}: Latitude = {latitude}, Longitude = {longitude}")

    # Return True to indicate successful update (or False if update failed in a real app)
    return True


request_user_geolocation_consent(1)