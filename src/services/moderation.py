from users_data import block_user
import json

user_flags = {}

def moderate_text(text, sender_id, recipient_id):
    """
    Moderates a text message to check for inappropriate content.

    Args:
        text (str): The text message to moderate.
        sender_id (int): The ID of the user sending the message.
        recipient_id (int): The ID of the user receiving the message.

    Returns:
        bool: True if the message is appropriate, False otherwise.
    """
    bad_words = ["badword1", "badword2", "badword3"]
    for word in bad_words:
        if word in text.lower():
            block_user(sender_id, "Inappropriate language used.")
            return False
    return True

def moderate_media(media_data, uploader_id):
    """
    Moderates media content to check for inappropriate material.

    Args:
        media_data: The media data to moderate.
        uploader_id (int): The ID of the user uploading the media.

    Returns:
        bool: True if the media is appropriate, False otherwise.
    """
    # Placeholder: Media moderation logic will be implemented here later.
    return True

def moderate_content(content):
    """
    Moderates content to check if it's appropriate.

    Args:
        content (str): The content to moderate.

    Returns:
        bool: True if the content is safe, False otherwise.
    """
    if not isinstance(content, str):
        raise ValueError("Content must be a string")
    
    if not content.strip():
        return True  # Empty content is considered safe
        
    try:
        # TODO: Implement actual content moderation logic here
        # For now, we'll use a simple placeholder
        result = json.loads('{"result": true}')
        return result["result"]
    except json.JSONDecodeError as e:
        print(f"Error parsing moderation result: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error during content moderation: {e}")
        return False


def flag_user(user_id):
    """
    Flags a user, incrementing their flag counter.

    Args:
        user_id (int): The ID of the user to flag.

    Returns:
        bool: True if the user is now considered dangerous, False otherwise.
    """
    global user_flags
    if user_id not in user_flags:
        user_flags[user_id] = 0
    user_flags[user_id] += 1

    if user_flags[user_id] >= 3:  # Threshold for being considered dangerous
        return True
    return False

def get_dangerous_users():
    """
    Retrieves a list of users considered dangerous.

    Returns:
        list: A list of user IDs that are considered dangerous.
    """
    global user_flags
    dangerous_users = [user_id for user_id, flags in user_flags.items() if flags >= 3]
    return dangerous_users