export const EXPIRES_TIME = {
  "5m": 5 * 60 * 1000,
  "1h": 3600 * 1000,
  "7d": 7 * 24 * 3600 * 1000,
};

export const PAGE = 1;
export const LIMIT = 30;

export const ENVIROMENT = {
  prod: "production",
  stg: "staging",
  dev: "development",
};

export const ERROR_CODE = {
  OK: 200,
  created: 201,
  noContent: 204,

  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,

  internalServer: 500,
  badGateway: 502,
};
