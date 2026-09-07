import { SignIn } from "@clerk/nextjs";
import { AuthScreen } from "@/components/layout/auth-screen";

export default function SignInPage() {
  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue your dossier workspace."
    >
      <SignIn />
    </AuthScreen>
  );
}
