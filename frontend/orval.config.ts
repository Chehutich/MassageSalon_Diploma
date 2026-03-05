export default {
  serenity: {
    input: "./v1.json",
    output: {
      mode: "tags-split",
      target: "./src/api/generated",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/api/client.ts",
          name: "api",
        },
      },
    },
  },
};
