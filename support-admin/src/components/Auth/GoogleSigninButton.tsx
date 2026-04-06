import { GoogleIcon } from "@/assets/icons";

export default function GoogleSigninButton({ text }: { text: string }) {
  return (
    <button className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-[15px] font-medium text-gray-7 hover:bg-gray-2 dark:border-gray-6 dark:bg-dark-3 dark:text-gray-3 dark:hover:bg-dark-2">
      <GoogleIcon />
      {text} with Google
    </button>
  );
}
