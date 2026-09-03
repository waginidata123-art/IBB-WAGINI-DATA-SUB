import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/services/ServicePage";

export const Route = createFileRoute("/_authenticated/exams")({
  component: () => {
    const { user } = Route.useRouteContext();
    return <ServicePage user={user} code="exams" />;
  },
});
