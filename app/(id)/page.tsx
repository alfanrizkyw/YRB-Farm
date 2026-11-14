import Home from "@/components/site/Home";
import { getPublicContent } from "@/lib/store";

export const revalidate = 30;

export default async function Page() {
  const content = await getPublicContent();
  return <Home lang="id" content={content} />;
}
