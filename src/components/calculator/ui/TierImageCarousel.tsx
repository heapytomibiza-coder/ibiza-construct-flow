import { useMemo } from "react"

import { cn } from "@/lib/utils"

type TierImageCarouselProps = {
  images: string[]
  className?: string
}

export const TierImageCarousel = ({ images, className }: TierImageCarouselProps) => {
  const selectedImages = useMemo(() => images.slice(0, 3), [images])

  if (!selectedImages.length) {
    return null
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {selectedImages.map((image, index) => (
        <div
          key={image}
          className="relative h-20 overflow-hidden rounded-lg border border-indigo-100 bg-muted"
        >
          <img
            src={`${image}?auto=format&fit=crop&w=360&h=240`}
            alt="Quality tier reference"
            className={cn("h-full w-full object-cover", index === 0 ? "" : "opacity-80")}
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
    </div>
  )
}
