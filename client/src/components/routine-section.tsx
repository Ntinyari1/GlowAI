import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, X, Plus } from "lucide-react";
import { RoutineStep } from "@/lib/types";

interface RoutineSectionProps {
  title: string;
  icon: "sun" | "moon";
  steps: RoutineStep[];
  onStepsChange: (steps: RoutineStep[]) => void;
}

export default function RoutineSection({ title, icon, steps, onStepsChange }: RoutineSectionProps) {
  const IconComponent = icon === "sun" ? Sun : Moon;
  const iconColor = icon === "sun" ? "text-yellow-600" : "text-purple-600";
  const bgColor = icon === "sun" ? "bg-yellow-100" : "bg-purple-100";
  const stepColor = icon === "sun" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600";

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onStepsChange(newSteps);
  };

  const addStep = () => {
    const newStep: RoutineStep = {
      order: steps.length + 1,
      category: "product",
      description: "New product step",
      productName: "Click to edit"
    };
    onStepsChange([...steps, newStep]);
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
            <IconComponent className={`${iconColor} w-5 h-5`} />
          </div>
          <span className="text-xl text-gray-800">{title}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 ${stepColor} rounded-full flex items-center justify-center font-semibold text-sm`}>
              {step.order}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{step.productName || step.category}</p>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeStep(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <Button
          onClick={addStep}
          className="w-full mt-6 glow-gradient-soft text-glow-purple font-semibold py-3"
        >
          <Plus className="mr-2 w-4 h-4" />
          Add Product
        </Button>
      </CardContent>
    </Card>
  );
}
