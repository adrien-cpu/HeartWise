from users_data import block_user

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