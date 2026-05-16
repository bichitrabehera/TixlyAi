export type Ticket = {
  title: string;
  description: string;
  priority?: string;
  steps?: string[];
};

export type IntegrationTool = "slack" | "linear" | "jira";

export type SendResult = {
  success: boolean;
  error?: string;
};
