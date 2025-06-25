import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  required: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Version mobile - TOUJOURS VISIBLE EN HAUT */}
      <div className="block lg:hidden">
        {/* Conteneur mobile épinglé - POSITION RELATIVE POUR ÊTRE TOUJOURS VISIBLE */}
        <div className="relative w-full z-30 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-2 py-2">
            <div className="flex overflow-x-auto gap-1 scrollbar-thin">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-200 min-w-[60px] px-1",
                    index <= currentStep ? "opacity-100" : "opacity-60"
                  )}
                  onClick={() => onStepClick?.(index)}
                >
                  {/* Cercle compact */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-[10px] mb-1 transition-all duration-200 shadow-sm",
                      step.status === 'completed' && "bg-green-500",
                      step.status === 'active' && "bg-blue-500 ring-2 ring-blue-200 scale-110",
                      step.status === 'error' && "bg-red-500",
                      step.status === 'pending' && "bg-gray-400"
                    )}
                  >
                    {step.status === 'completed' ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : step.status === 'error' ? (
                      <X className="w-2.5 h-2.5" />
                    ) : (
                      <span className="text-[9px]">{step.icon}</span>
                    )}
                  </div>

                  {/* Titre compact */}
                  <div className="text-center max-w-[60px]">
                    <div
                      className={cn(
                        "text-[9px] font-medium leading-tight text-center",
                        step.status === 'active' && "text-blue-600 font-bold",
                        step.status === 'completed' && "text-green-600",
                        step.status === 'error' && "text-red-600",
                        step.status === 'pending' && "text-gray-600"
                      )}
                      title={step.title}
                    >
                      {step.title.length > 7 ? step.title.substring(0, 7) + '.' : step.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Ligne de progression */}
            <div className="relative mt-1.5">
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
              <div
                className="absolute top-0 left-0 h-0.5 bg-blue-500 transition-all duration-500 rounded"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
            
            {/* Indicateur compact */}
            <div className="text-center mt-1">
              <span className="text-[9px] text-gray-600 font-semibold">
                {currentStep + 1}/{steps.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Version desktop améliorée */}
      <div className="hidden lg:flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105",
              index <= currentStep ? "opacity-100" : "opacity-50"
            )}
            onClick={() => onStepClick?.(index)}
          >
            {/* Cercle avec icône */}
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg mb-2 transition-all duration-200 shadow-lg",
                step.status === 'completed' && "bg-green-500 hover:bg-green-600",
                step.status === 'active' && "bg-blue-500 ring-4 ring-blue-200 hover:bg-blue-600",
                step.status === 'error' && "bg-red-500 hover:bg-red-600",
                step.status === 'pending' && "bg-gray-300 hover:bg-gray-400"
              )}
            >
              {step.status === 'completed' ? (
                <Check className="w-6 h-6" />
              ) : step.status === 'error' ? (
                <X className="w-6 h-6" />
              ) : (
                <span className="text-sm">{step.icon}</span>
              )}
            </div>

            {/* Titre et description */}
            <div className="text-center">
              <div
                className={cn(
                  "text-sm font-medium",
                  step.status === 'active' && "text-blue-600",
                  step.status === 'completed' && "text-green-600",
                  step.status === 'error' && "text-red-600",
                  step.status === 'pending' && "text-gray-500"
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1 max-w-20 leading-tight">
                {step.description}
              </div>
            </div>

            {/* Badge requis */}
            {step.required && (
              <div className="mt-1">
                <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                  Requis
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ligne de progression desktop */}
      <div className="relative hidden lg:block">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 rounded"></div>
        <div
          className="absolute top-0 left-0 h-0.5 bg-blue-500 transition-all duration-500 rounded"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}; 