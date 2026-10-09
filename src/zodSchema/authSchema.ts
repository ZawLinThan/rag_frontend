import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type SignInType = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema
  .extend({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(120, "Use at most 120 characters."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpType = z.infer<typeof signUpSchema>;

export const authSchema = signInSchema
  .extend({
    mode: z.enum(["login", "signup"]),
    fullName: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, context) => {
    if (data.mode !== "signup") return;
    const result = signUpSchema.safeParse(data);
    if (!result.success)
      result.error.issues.forEach((issue) =>
        context.addIssue({
          code: "custom",
          message: issue.message,
          path: issue.path,
        }),
      );
  });
export type AuthFormType = z.infer<typeof authSchema>;
