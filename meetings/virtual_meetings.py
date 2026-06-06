# Virtual meetings logic will be implemented here
from users_data import get_user_data, compare_interests, compare_psychological_traits

meetings = {}  # Dictionary to store meeting data: {meeting_id: [user_id1, user_id2, ...]}


def create_meeting(users):
    """
    Creates a new virtual meeting.

    Args:
        users: A list of user IDs to include in the meeting.

    Returns:
        The ID of the newly created meeting.
    """
    meeting_id = len(meetings) + 1  # Generate a unique meeting ID (for simplicity)
    meetings[meeting_id] = users  # Add the meeting to the dictionary
    return meeting_id


def join_meeting(meeting_id, user_id):
    """
    Adds a user to an existing virtual meeting.

    Args:
        meeting_id: The ID of the meeting to join.
        user_id: The ID of the user to add.
    """
    if meeting_id in meetings:
        meetings[meeting_id].append(user_id)
    else:
        print(f"Error: Meeting with ID {meeting_id} not found.")


def end_meeting(meeting_id):
    """
    Ends a virtual meeting by removing it from the dictionary.

    Args:
        meeting_id: The ID of the meeting to end.
    """
    if meeting_id in meetings:
        del meetings[meeting_id]
    else:
        print(f"Error: Meeting with ID {meeting_id} not found.")


def remove_user_from_meeting(meeting_id, user_id):
    """
    Removes a user from a virtual meeting.

    Args:
        meeting_id: The ID of the meeting.
        user_id: The ID of the user to remove.
    """
    if meeting_id in meetings:
        if user_id in meetings[meeting_id]:
            meetings[meeting_id].remove(user_id)
        else:
            print(f"Error: User with ID {user_id} not found in meeting {meeting_id}.")


def get_meeting_compatibility(user_id1, user_id2):
    """
    Calculates the compatibility rate between two users based on their
    profiles, interests, and psychological traits.

    Args:
        user_id1: The ID of the first user.
        user_id2: The ID of the second user.

    Returns:
        A compatibility score between 0 and 1, where 1 indicates perfect
        compatibility.
    """

    user1_data = get_user_data(user_id1)
    user2_data = get_user_data(user_id2)

    if not user1_data or not user2_data:
        return 0.0  # Return 0 if user data is not available

    # Compare interests
    interests_compatibility = compare_interests(
        user1_data.get("interests", []), user2_data.get("interests", [])
    )

    # Compare psychological traits
    traits_compatibility = compare_psychological_traits(user_id1, user_id2)

    # Combine compatibility scores (adjust weights as needed)
    total_compatibility = (interests_compatibility + traits_compatibility) / 2

    return min(max(total_compatibility, 0), 1)  # Ensure the score is between 0 and 1