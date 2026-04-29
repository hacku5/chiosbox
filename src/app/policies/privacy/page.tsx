import { PolicyViewer } from "@/components/policy-viewer";

export const metadata = {
  title: "Gizlilik Politikası | ChiosBox",
};

export default function PrivacyPage() {
  return <PolicyViewer slug="privacy" />;
}
