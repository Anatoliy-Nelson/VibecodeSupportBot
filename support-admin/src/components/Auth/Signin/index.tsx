import Link from "next/link";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <>
      <GoogleSigninButton text="Sign in" />

      <div className="my-6 flex items-center justify-center">
        <span className="block h-px w-full bg-gray-3 dark:bg-gray-6"></span>
        <div className="block w-full min-w-fit bg-white px-3 text-center font-medium text-gray-5 dark:bg-dark-2 dark:text-gray-4">
          Or sign in with email
        </div>
        <span className="block h-px w-full bg-gray-3 dark:bg-gray-6"></span>
      </div>

      <div>
        <SigninWithPassword />
      </div>

      <div className="mt-6 text-center">
        <p>
          Don't have any account?{" "}
          <Link href="/auth/sign-up" className="text-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
}
