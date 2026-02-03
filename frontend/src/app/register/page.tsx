import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl text-green-600 font-bold text-center mb-6">
          Créer un compte
        </h1>

        <RegisterForm />

        <p className="mt-4 text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-green-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
