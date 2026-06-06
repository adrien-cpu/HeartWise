from src.services.face_analysis import compare_faces, get_psychological_traits
from users_data import get_user_data


def get_speed_dating_compatibility(user1_id, user2_id):
    user1 = get_user_data(user1_id)
    user2 = get_user_data(user2_id)

    face_compatibility = compare_faces(user1['profile_picture'], user2['profile_picture'])
    interests_compatibility = len(set(user1['interests']) & set(user2['interests'])) / len(set(user1['interests']) | set(user2['interests'])) if len(set(user1['interests']) | set(user2['interests'])) > 0 else 0
    psychological_traits_compatibility = len(set(getPsychologicalTraits(user1['profile_picture'])) & set(getPsychologicalTraits(user2['profile_picture']))) / len(set(getPsychologicalTraits(user1['profile_picture'])) | set(getPsychologicalTraits(user2['profile_picture']))) if len(set(getPsychologicalTraits(user1['profile_picture'])) | set(getPsychologicalTraits(user2['profile_picture']))) > 0 else 0

    return (face_compatibility + interests_compatibility + psychological_traits_compatibility) / 3