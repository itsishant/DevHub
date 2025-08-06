import z from "zod";

export const SignUpZod = z.object({
  username: z.string().min(3, { message: "username is too short" }),
  password: z.string().min(6, { message: "password must be 6 characters" }),
  Bio: z.array(
    z.object({
      firstname: z.string(),
      lastname: z.string(),
      email: z.string(),
      phone: z.string().min(10).max(10),
      skills: z.array(z.string())
    })
  ),
  Avatar: z.string()
});
