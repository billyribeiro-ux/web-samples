import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignIn routing="path" path="/login" signUpUrl="/register" />
    </div>
  );
}
