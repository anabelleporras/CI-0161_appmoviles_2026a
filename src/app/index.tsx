import { Redirect } from "expo-router";

export default function Index() {
  // TODO: check for stored sessionToken here and redirect to (app) instead
  return <Redirect href="/login" />;
}
