import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/services/ServicePage";

export const Route = createFileRoute("/_authenticated/airtime")({
  component: () => {
    const { user } = Route.useRouteContext();
    return <ServicePage user={user} code="airtime" />;
  },
});
