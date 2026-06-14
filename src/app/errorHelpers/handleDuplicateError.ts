import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Extract value within double quotes using regex
  const match = err.message.match(/"([^"]*)"/);
  const extractedMessage = match ? match[1] : "";

  // Get field path from error
  const key = Object.keys(err.keyValue || {})[0] || "field";

  const errorSources: TErrorSources = [
    {
      path: key,
      message: `${extractedMessage} already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: "Duplicate Key Error",
    errorSources,
  };
};
