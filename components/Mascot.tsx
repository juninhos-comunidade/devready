import Image, { type StaticImageData } from "next/image";
import mascotCoach from "@/public/brand/mascot-coach.webp";
import mascotLaunch from "@/public/brand/mascot-launch.webp";
import mascotWave from "@/public/brand/mascot-wave.webp";

export type MascotPose = "coach" | "launch" | "wave";
export type MascotMotion = "arrive" | "float" | "launch" | "none";

const mascotAssets: Record<MascotPose, StaticImageData> = {
  coach: mascotCoach,
  launch: mascotLaunch,
  wave: mascotWave,
};

const motionClasses: Record<MascotMotion, string> = {
  arrive: "mascot-arrive",
  float: "mascot-float",
  launch: "mascot-launch",
  none: "",
};

export function Mascot({
  pose = "wave",
  motion = "float",
  alt = "",
  className = "",
  priority = false,
}: {
  pose?: MascotPose;
  motion?: MascotMotion;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={mascotAssets[pose]}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      priority={priority}
      draggable={false}
      sizes="(max-width: 768px) 160px, 280px"
      className={`select-none object-contain drop-shadow-[0_18px_22px_rgba(13,14,36,0.2)] ${motionClasses[motion]} ${className}`}
    />
  );
}
