import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return <EditProfileForm />;
}
