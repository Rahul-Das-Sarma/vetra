import { SignUp } from "@clerk/nextjs";
import { AuthScreen } from "@/components/layout/auth-screen";

export default function SignUpPage() {
  return (
    <AuthScreen
      title="Create your account"
      subtitle="Start turning interviews into client-ready dossiers."
    >
      <SignUp />
    </AuthScreen>
  );
}
