import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "../zodSchema/authSchema";
import type { AuthFormType } from "../zodSchema/authSchema";
import type { AuthFormProps } from "../types/study";
import { supabase } from "../lib/supabase/client";
import { useAuthStore } from "../stores/authStore";

export const useAuthForm = (mode: AuthFormProps["mode"]) => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const form = useForm<AuthFormType>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode,
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submit = async (values: AuthFormType) => {
    setMessage("");
    if (!supabase) {
      form.setError("root", {
        message:
          "Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable authentication.",
      });
      return;
    }

    try {
      const { data, error } =
        values.mode === "signup"
          ? await supabase.auth.signUp({
              email: values.email,
              password: values.password,
              options: {
                data: { full_name: values.fullName },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            })
          : await supabase.auth.signInWithPassword({
              email: values.email,
              password: values.password,
            });

      if (error) {
        form.setError("root", { message: error.message });
        return;
      }

      useAuthStore.getState().setUser(data.user);
      console.log("data.user", useAuthStore.getState().user);
      form.resetField("password");
      form.resetField("confirmPassword");
      if (data.session) {
        navigate("/", { replace: true });
      } else {
        setMessage(
          "Check your email to confirm your account. Open the confirmation link in this browser, then sign in with your email and password.",
        );
      }
    } catch {
      form.setError("root", {
        message: "Unable to connect. Please try again.",
      });
    }
  };
  return { ...form, submit, message };
};
