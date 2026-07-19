import { ThemeWorkspace } from "@/components/theme-workspace";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ThemeDetailPage({ params }: Props) {
  const { id } = await params;
  return <ThemeWorkspace themeId={id} />;
}
