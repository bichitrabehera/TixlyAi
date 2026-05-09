export const slackStore = {
  accessToken: "",
  userId: "",
  teamId: ""
};

export function setSlackToken(token: string, userId: string, teamId: string) {
  slackStore.accessToken = token;
  slackStore.userId = userId;
  slackStore.teamId = teamId;
}

export function getSlackToken() {
  return slackStore.accessToken;
}

export function getSlackUserId() {
  return slackStore.userId;
}

export function isSlackConnected() {
  return !!slackStore.accessToken && !!slackStore.userId;
}