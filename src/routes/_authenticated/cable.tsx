import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/services/ServicePage";

export const Route = createFileRoute("/_authenticated/cable")({
  component: () => {
    const { user } = Route.useRouteContext();
    return <ServicePage user={user} code="cable" />;
  },
});
