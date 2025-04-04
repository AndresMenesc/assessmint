
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative w-12 h-12">
        {/* Outer circle */}
        <div className="absolute inset-0 border-4 border-orbit-blue rounded-full"></div>
        {/* Inner circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-orbit-teal rounded-full"></div>
      </div>
      
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
