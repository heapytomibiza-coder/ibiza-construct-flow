import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  labels?: string[];
}

const StarSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  StarSliderProps
>(({ className, labels, ...props }, ref) => {
  const [value, setValue] = React.useState(props.value || [3]);
  const currentValue = (props.value?.[0] || value[0]) as number;

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue);
    props.onValueChange?.(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleValueChange([star])}
            className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
          >
            <Star
              className={cn(
                "w-10 h-10 transition-colors duration-200",
                star <= currentValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
        value={value}
        onValueChange={handleValueChange}
        min={1}
        max={5}
        step={1}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      
      {labels && labels[currentValue - 1] && (
        <p className="text-center text-sm font-medium text-muted-foreground">
          {labels[currentValue - 1]}
        </p>
      )}
    </div>
  );
});
StarSlider.displayName = "StarSlider";

export { StarSlider };
