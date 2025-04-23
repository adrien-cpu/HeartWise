"""
This module manages user-related data, including consent for geolocation, blocked users, and game preferences.
"""

user_data = {}
users_consent = {}
blocked_users = {}


def create_user(user_id, user_info):
    """
    Creates a new user with the given ID and information.

    Args:
        user_id: The ID of the user.
        user_info: A dictionary containing user information such as name, age, interests, etc.
    """
    if user_id not in user_data:
        user_data[user_id] = user_info
        user_data[user_id]["interests"] = []  # Initialize interests as an empty list
    else:
        print(f"Error: User with ID {user_id} already exists.")


def get_user(user_id):
    """
    Retrieves the information for a given user ID.

    Args:
        user_id: The ID of the user.

    Returns:
        A dictionary containing the user's information, or None if the user does not exist.
    """
    return user_data.get(user_id)



def get_user_geolocation_consent(user_id):
    """
    Gets the user's geolocation consent status, or sets it to False by default if not already set.

    Args:
        user_id: The ID of the user.

    Returns:
        True if the user has granted consent, False otherwise.
    """
    if user_id not in users_consent:
        if user_id not in user_data:
            user_data[user_id] = {
                "games_preferences": [],
                "speed_dating_schedule": [],
                "blind_matching_schedule": [],
                "games_schedule": [],
            }
        users_consent[user_id] = False
    return users_consent[user_id]


def set_user_geolocation_consent(user_id, consent):
    """
    Sets the user's geolocation consent to the specified value.

    Args:
        user_id: The ID of the user.
        consent: True to grant consent, False to deny.
    """
    users_consent[user_id] = consent


def request_user_geolocation_consent(user_id):
    """
    Asks the user for geolocation permission.

    Args:
        user_id: The ID of the user.

    Returns:
        True if the user granted consent, False otherwise.
    """
    print("This app needs access to your geolocation to find nearby users.")
    response = input("Do you allow this app to access your geolocation? (yes/no): ")
    if response.lower() == "yes":
        set_user_geolocation_consent(user_id, True)
        return True
    else:
        set_user_geolocation_consent(user_id, False)
        return False


def block_user(user_id, reason):
    """
    Blocks a user, adding them to the blocked_users dictionary with a reason.

    Args:
        user_id: The ID of the user to block.
        reason: The reason for blocking the user.
    """
    blocked_users[user_id] = reason


def is_user_blocked(user_id):
    """
    Checks if a user is blocked.

    Args:
        user_id: The ID of the user to check.

    Returns:
        True if the user is blocked, False otherwise.
    """
    return user_id in blocked_users


def unblock_user(user_id):
    """
    Unblocks a user, removing them from the blocked_users dictionary.

    Args:
        user_id: The ID of the user to unblock.
    """
    if is_user_blocked(user_id):
        del blocked_users[user_id]
    else:
        print(f"Error: User {user_id} is not currently blocked.")


def get_user_game_preferences(user_id):
    """
    Gets the user's game preferences.

    Args:
        user_id: The ID of the user.

    Returns:
        A list of game IDs representing the user's preferences.
    """
    if user_id not in user_data:
        user_data[user_id] = {
            "games_preferences": [],
            "speed_dating_schedule": [],
            "blind_matching_schedule": [],
            "games_schedule": [],
        }
    return user_data[user_id]["games_preferences"]


def set_user_game_preferences(user_id, preferences):
    """
    Sets the user's game preferences.

    Args:
        user_id: The ID of the user.
        preferences: A list of game IDs representing the user's preferences.
    """
    if user_id not in user_data:
        user_data[user_id] = {
            "games_preferences": [],
            "speed_dating_schedule": [],
            "blind_matching_schedule": [],
            "games_schedule": [],
        }
    user_data[user_id]["games_preferences"] = preferences


def get_user_speed_dating_schedule(user_id):
    """
    Gets the user's speed dating schedule.

    Args:
        user_id: The ID of the user.

    Returns:
        A list of days of the week (0-6, Monday-Sunday) for speed dating.
    """
    if user_id not in user_data:
        user_data[user_id] = {
            "games_preferences": [],
            "speed_dating_schedule": [],
            "blind_matching_schedule": [],
            "games_schedule": [],
        }
    return user_data[user_id]["speed_dating_schedule"]


def set_user_speed_dating_schedule(user_id, schedule):
    """
    Sets the user's speed dating schedule.

    Args:
        user_id: The ID of the user.
        schedule: A list of days of the week (0-6, Monday-Sunday).
    """
    if user_id not in user_data:
        user_data[user_id] = {
            "games_preferences": [],
            "speed_dating_schedule": [],
            "blind_matching_schedule": [],
            "games_schedule": [],
        }
    user_data[user_id]["speed_dating_schedule"] = schedule


def get_user_blind_matching_schedule(user_id):
    if user_id not in user_data:
        user_data[user_id] = {
            "games_preferences": [],
            "speed_dating_schedule": [],
            "blind_matching_schedule": [],
            "games_schedule": [],
        }
    return user_data[user_id]["blind_matching_schedule"]


def set_user_blind_matching_schedule(user_id, schedule):
    if user_id not in user_data:
        user_data[user_id] = {
            "games_preferences": [],
            "speed_dating_schedule": [],
            "blind_matching_schedule": [],
            "games_schedule": [],
        }
    user_data[user_id]["blind_matching_schedule"] = schedule
