import {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  GraduationCap,
  Fingerprint,
  type LucideIcon,
} from "lucide-react";

export type ServiceCode = "airtime" | "data" | "electricity" | "cable" | "exams" | "nin";

export const SERVICE_META: Record<
  ServiceCode,
  { label: string; icon: LucideIcon; path: string; tagline: string }
> = {
  airtime: {
    label: "Airtime",
    icon: Smartphone,
    path: "/airtime",
    tagline: "Instant top-up on all networks",
  },
  data: { label: "Data", icon: Wifi, path: "/data", tagline: "SME, Gifting & Corporate bundles" },
  electricity: {
    label: "Electricity",
    icon: Zap,
    path: "/electricity",
    tagline: "Prepaid tokens & postpaid bills",
  },
  cable: { label: "Cable TV", icon: Tv, path: "/cable", tagline: "DStv, GOtv & Startimes" },
  exams: {
    label: "Exams",
    icon: GraduationCap,
    path: "/exams",
    tagline: "WAEC, NECO, NABTEB & JAMB PINs",
  },
  nin: {
    label: "NIN Verification",
    icon: Fingerprint,
    path: "/nin",
    tagline: "Secure identity verification",
  },
};

export const SERVICE_ORDER: ServiceCode[] = [
  "airtime",
  "data",
  "electricity",
  "cable",
  "exams",
  "nin",
];
