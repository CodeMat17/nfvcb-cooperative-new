import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  // Check if user is already authenticated
  const { userId } = await auth();

  // If user is authenticated, redirect to admin
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className='flex justify-center py-12'>
      <SignIn />
    </div>
  );
}
