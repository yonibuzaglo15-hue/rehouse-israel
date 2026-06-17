import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-white/50">
          טוען...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
