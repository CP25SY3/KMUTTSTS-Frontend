export type LoginInput = { identifier: string; password: string };

export type StrapiUser = {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type LoginResponse = {
  jwt: string;
  user: StrapiUser;
};

export type MicrosoftAuthResponse = {
  accessToken: string;
  idToken: string;
  account: {
    username: string;
    name: string;
    localAccountId: string;
  };
};
