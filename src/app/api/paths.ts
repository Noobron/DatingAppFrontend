// URL Paths for the backend API
export enum API_Paths {
  register = 'accounts/register/',
  login = 'accounts/login/',
  loginRefresh = 'accounts/login/refresh/',
  logout = 'accounts/logout/',
  users = 'accounts/users/',
  photos = 'accounts/get-photos/',
  editProfile = 'accounts/edit-profile/',
  addPhoto = 'accounts/add-photo/',
  deletePhoto = 'accounts/delete-photo/',
  likeUser = 'accounts/like-user/',
  unlikeUser = 'accounts/unlike-user/',
  hasLiked = 'accounts/has-liked/',

  chatFeed = 'chat/get-chat-feed/',
  chatMessages = 'chat/get-chat-messages/',
  markChatMessagesAsSeen = 'chat/mark-chat-message-as-seen/',
}
