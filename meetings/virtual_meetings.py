# Virtual meetings logic will be implemented here

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
    else:
        print(f"Error: Meeting with ID {meeting_id} not found.")