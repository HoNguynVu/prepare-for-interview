import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Network,
  Cpu,
  Binary,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type Locale = "en" | "vi";
export const locales: Locale[] = ["en", "vi"];
export const defaultLocale: Locale = "vi";

export type TopicId = "oop" | "network" | "os" | "dsa" | "auth" | "other";

export interface Topic {
  id: TopicId;
  icon: LucideIcon;
  color: string;
  title: { en: string; vi: string };
  description: { en: string; vi: string };
}

export const topics: Topic[] = [
  {
    id: "oop",
    icon: Boxes,
    color: "from-indigo-500 to-purple-500",
    title: { en: "Object-Oriented Programming", vi: "Lập trình hướng đối tượng" },
    description: {
      en: "Encapsulation, inheritance, polymorphism, abstraction, SOLID, design patterns.",
      vi: "Đóng gói, kế thừa, đa hình, trừu tượng, SOLID, design patterns.",
    },
  },
  {
    id: "network",
    icon: Network,
    color: "from-sky-500 to-cyan-500",
    title: { en: "Computer Network", vi: "Mạng máy tính" },
    description: {
      en: "OSI model, TCP/IP, HTTP/HTTPS, DNS, sockets, common protocols.",
      vi: "Mô hình OSI, TCP/IP, HTTP/HTTPS, DNS, socket, các giao thức phổ biến.",
    },
  },
  {
    id: "os",
    icon: Cpu,
    color: "from-emerald-500 to-teal-500",
    title: { en: "Operating System", vi: "Hệ điều hành" },
    description: {
      en: "Processes, threads, scheduling, memory, deadlock, file systems.",
      vi: "Tiến trình, luồng, lập lịch, bộ nhớ, deadlock, hệ thống file.",
    },
  },
  {
    id: "dsa",
    icon: Binary,
    color: "from-amber-500 to-orange-500",
    title: { en: "Data Structures & Algorithms", vi: "Cấu trúc dữ liệu & Giải thuật" },
    description: {
      en: "Arrays, lists, trees, graphs, sorting, searching, DP, complexity.",
      vi: "Mảng, danh sách, cây, đồ thị, sắp xếp, tìm kiếm, quy hoạch động, độ phức tạp.",
    },
  },
  {
    id: "auth",
    icon: ShieldCheck,
    color: "from-rose-500 to-pink-500",
    title: { en: "Authentication & Security", vi: "Xác thực & Bảo mật" },
    description: {
      en: "Sessions, JWT, OAuth2, OpenID Connect, hashing, common attacks.",
      vi: "Session, JWT, OAuth2, OpenID Connect, băm mật khẩu, các cuộc tấn công thường gặp.",
    },
  },
  {
    id: "other",
    icon: Sparkles,
    color: "from-fuchsia-500 to-violet-500",
    title: { en: "Other Topics", vi: "Chủ đề khác" },
    description: {
      en: "Databases, system design, Git, CI/CD, soft skills, behavioral questions.",
      vi: "Cơ sở dữ liệu, thiết kế hệ thống, Git, CI/CD, kỹ năng mềm, câu hỏi hành vi.",
    },
  },
];

export const topicMap = Object.fromEntries(topics.map((t) => [t.id, t])) as Record<TopicId, Topic>;

export const levelLabels = {
  beginner: { en: "Beginner", vi: "Cơ bản" },
  intermediate: { en: "Intermediate", vi: "Trung cấp" },
  advanced: { en: "Advanced", vi: "Nâng cao" },
} as const;

export type Level = keyof typeof levelLabels;
