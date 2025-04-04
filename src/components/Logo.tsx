
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <img src="/orbit.png" alt="Orbit Insights Logo" className="w-12 h-12" />
      
      {showText && (
        <div className="ml-3 font-semibold text-2xl">
          <span className="text-orbit-blue">orbit</span>
          <span className="text-orbit-teal">insights</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
