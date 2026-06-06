# geolocation_meetings.py
import math

# For this implementation, we set the user_id to 1 by default.
from users_data import get_user_geolocation_consent, request_user_geolocation_consent, set_user_geolocation_consent
from users_data import get_user_location

from users_data import get_user_geolocation_consent, request_user_geolocation_consent


class User:
    def __init__(self, user_id, name, latitude, longitude):
        self.user_id = user_id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude


def compare_interests(user1_interests, user2_interests):
    """
    Compares the interests of two users and returns a compatibility score.
    This is a placeholder and should be replaced with a real implementation.
    """
    common_interests = set(user1_interests) & set(user2_interests)
    all_interests = set(user1_interests) | set(user2_interests)
    if not all_interests:
        return 0.5  # Neutral if no interests are listed
    return len(common_interests) / len(all_interests)


def compare_psychological_traits(user1_traits, user2_traits):
    """
    Compares the psychological traits of two users and returns a compatibility score.
    """


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


def get_meeting_compatibility(user1, user2):
    """
    Calculates the meeting compatibility between two users based on
    location proximity, interests, and psychological traits.
    """
    # Check if users are near each other
    location1 = get_user_location(user1.user_id)
    location2 = get_user_location(user2.user_id)
    if not location1 or not location2:
        print("Could not retrieve user locations.")
        return 0
    distance = calculate_distance(
        User(user1.user_id, user1.name, location1["latitude"], location1["longitude"]),
        User(user2.user_id, user2.name, location2["latitude"], location2["longitude"]),
    )
    proximity_score = 1 if distance <= 10 else 0.1  # Example: within 10km is considered near

    # Compare interests
    interests_score = compare_interests(user1.interests, user2.interests)

    # Compare psychological traits (placeholder)
    traits_score = compare_psychological_traits(user1.traits, user2.traits)

    # Combine scores (adjust weights as needed)
    compatibility_rate = (proximity_score * 0.3) + (interests_score * 0.4) + (traits_score * 0.3)

    return compatibility_rate


def schedule_meeting(user1, user2, compatibility_rate):
    """
    Schedules a meeting if the compatibility rate is good and users are near each other.
    """
    if compatibility_rate >= 0.7:  # Example threshold
        print(f"Meeting scheduled between {user1.name} and {user2.name} with a compatibility rate of {compatibility_rate:.2f}.")
        # Here you would add actual scheduling logic, e.g., creating an event
    else:
        print(f"Meeting not scheduled between {user1.name} and {user2.name}. Compatibility rate: {compatibility_rate:.2f}.")