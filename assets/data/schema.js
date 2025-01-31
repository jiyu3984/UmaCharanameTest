export const characterSchema = {
    type: "object",
    required: ["id", "image", "names", "seiyuu"],
    properties: {
      id: { type: "number" },
      image: { type: "string" },
      names: {
        type: "object",
        required: ["jp", "zh"],
        properties: {
          jp: { type: "string" },
          zh: { type: "string" },
          aliases: { type: "array" },
          en: { type: "string" }
        }
      },
      seiyuu: {
        type: "object",
        required: ["jp", "zh"],
        properties: {
          jp: { type: "string" },
          zh: { type: "string" },
          aliases: { type: "array" },
          en: { type: "string" }
        }
      },
      mainColor: { type: "string" },
      subColor: { type: "string" }
    }
  }