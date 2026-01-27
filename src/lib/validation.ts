import { z } from "zod";

export const workplaceCodeSchema = z
  .string()
  .min(1, "Platskod krävs")
  .max(20, "Platskod får vara max 20 tecken")
  .regex(/^[A-Z0-9-]+$/i, "Platskod får endast innehålla bokstäver, siffror och bindestreck")
  .transform((val) => val.toUpperCase());

export const emailSchema = z
  .string()
  .min(1, "E-post krävs")
  .email("Ogiltig e-postadress")
  .max(255, "E-post får vara max 255 tecken");

export const passwordSchema = z
  .string()
  .min(6, "Lösenordet måste vara minst 6 tecken")
  .max(72, "Lösenordet får vara max 72 tecken");

export const fullNameSchema = z
  .string()
  .min(1, "Namn krävs")
  .max(100, "Namn får vara max 100 tecken")
  .regex(/^[\p{L}\s'-]+$/u, "Namn får endast innehålla bokstäver");

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupFormSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
