import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/services/ServicePage";

export const Route = createFileRoute("/_authenticated/nin")({
  component: () => {
    const { user } = Route.useRouteContext();
    return <ServicePage user={user} code="nin" />;
  },
});
