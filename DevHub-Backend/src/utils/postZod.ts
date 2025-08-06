import z, { string } from "zod";

export const postZod = z.object({
    content: z.string().min(1, {message: "content is too short"}),
    type: z.enum(["code", "note", "link"])
})
