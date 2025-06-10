"use client";

import { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface BlockPreviewProps {
  block: ContentBlock;
}

export function BlockPreview({ block }: BlockPreviewProps) {
  const { type, content, settings, title } = block;

  const renderBlock = () => {
    switch (type) {
      case "hero":
        return (
          <div
            className={cn(
              "relative min-h-[400px] flex items-center justify-center text-center p-8",
              settings?.backgroundColor && `bg-[${settings.backgroundColor}]`,
              settings?.textColor && `text-[${settings.textColor}]`
            )}
            style={{
              backgroundImage: settings?.imageUrl ? `url(${settings.imageUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="space-y-4 max-w-3xl">
              {title && <h1 className="text-4xl font-bold">{title}</h1>}
              {content && <p className="text-xl">{content}</p>}
              {settings?.buttonText && settings?.buttonUrl && (
                <Button
                  variant={settings.variant || "default"}
                  size={settings.size || "lg"}
                  asChild
                >
                  <a href={settings.buttonUrl}>{settings.buttonText}</a>
                </Button>
              )}
            </div>
          </div>
        );

      case "grid":
        return (
          <div
            className={cn(
              "p-8",
              settings?.backgroundColor && `bg-[${settings.backgroundColor}]`,
              settings?.textColor && `text-[${settings.textColor}]`
            )}
          >
            {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
            <div
              className={cn(
                "grid gap-8",
                settings?.columns === 2 && "grid-cols-1 md:grid-cols-2",
                settings?.columns === 3 && "grid-cols-1 md:grid-cols-3",
                settings?.columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              )}
            >
              {content && JSON.parse(content).map((item: any, index: number) => (
                <Card key={index} className="p-6">
                  {item.icon && (
                    <div className="mb-4">
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={48}
                        height={48}
                        className="mx-auto"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        );

      case "card":
        return (
          <Card
            className={cn(
              "overflow-hidden",
              settings?.cardStyle === "bordered" && "border-2",
              settings?.cardStyle === "shadowed" && "shadow-lg"
            )}
          >
            {settings?.imageUrl && (
              <div className="relative h-48">
                <Image
                  src={settings.imageUrl}
                  alt={settings.altText || title || ""}
                  fill
                  className={cn(
                    "object-cover",
                    settings.imageFit === "contain" && "object-contain",
                    settings.imageFit === "fill" && "object-fill"
                  )}
                />
              </div>
            )}
            <div className="p-6">
              {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
              {content && <p className="text-muted-foreground mb-4">{content}</p>}
              {settings?.buttonText && settings?.buttonUrl && (
                <Button
                  variant={settings.variant || "default"}
                  size={settings.size || "default"}
                  asChild
                >
                  <a href={settings.buttonUrl}>{settings.buttonText}</a>
                </Button>
              )}
            </div>
          </Card>
        );

      case "cta":
        return (
          <div
            className={cn(
              "p-8 rounded-lg text-center",
              settings?.backgroundColor && `bg-[${settings.backgroundColor}]`,
              settings?.textColor && `text-[${settings.textColor}]`
            )}
          >
            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
            {content && <p className="text-xl mb-6">{content}</p>}
            {settings?.buttonText && settings?.buttonUrl && (
              <Button
                variant={settings.variant || "default"}
                size={settings.size || "lg"}
                asChild
              >
                <a href={settings.buttonUrl}>{settings.buttonText}</a>
              </Button>
            )}
          </div>
        );

      case "text":
        return (
          <div
            className={cn(
              "prose max-w-none",
              settings?.backgroundColor && `bg-[${settings.backgroundColor}]`,
              settings?.textColor && `text-[${settings.textColor}]`
            )}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case "heading":
        const HeadingTag = settings?.level || "h1";
        return (
          <HeadingTag
            className={cn(
              "font-bold",
              settings?.weight === "medium" && "font-medium",
              settings?.weight === "semibold" && "font-semibold",
              settings?.weight === "bold" && "font-bold",
              settings?.textColor && `text-[${settings.textColor}]`
            )}
          >
            {content}
          </HeadingTag>
        );

      case "image":
        return (
          <div
            className={cn(
              "relative",
              settings?.alignment === "center" && "mx-auto",
              settings?.alignment === "right" && "ml-auto"
            )}
          >
            <Image
              src={content}
              alt={settings?.altText || ""}
              width={settings?.imageSize === "small" ? 300 : settings?.imageSize === "large" ? 800 : 500}
              height={settings?.imageSize === "small" ? 200 : settings?.imageSize === "large" ? 600 : 300}
              className={cn(
                "rounded-lg",
                settings?.imageFit === "contain" && "object-contain",
                settings?.imageFit === "fill" && "object-fill",
                "object-cover"
              )}
            />
            {settings?.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center">{settings.caption}</p>
            )}
          </div>
        );

      case "button":
        return (
          <Button
            variant={settings?.variant || "default"}
            size={settings?.size || "default"}
            className={cn(
              settings?.backgroundColor && `bg-[${settings.backgroundColor}]`,
              settings?.textColor && `text-[${settings.textColor}]`
            )}
            asChild
          >
            <a href={settings?.buttonUrl || "#"}>{content}</a>
          </Button>
        );

      case "divider":
        return (
          <Separator
            className={cn(
              "my-8",
              settings?.style === "dashed" && "border-dashed",
              settings?.style === "dotted" && "border-dotted",
              settings?.color && `border-[${settings.color}]`,
              settings?.thickness && `border-[${settings.thickness}]`
            )}
          />
        );

      case "spacer":
        return (
          <div
            style={{
              height: settings?.height || "32px",
              width: settings?.width || "100%",
            }}
          />
        );

      default:
        return <div>{content}</div>;
    }
  };

  return (
    <div
      className={cn(
        "w-full",
        settings?.padding && `p-[${settings.padding}]`,
        settings?.margin && `m-[${settings.margin}]`,
        settings?.borderRadius && `rounded-[${settings.borderRadius}]`,
        settings?.shadow === "sm" && "shadow-sm",
        settings?.shadow === "md" && "shadow-md",
        settings?.shadow === "lg" && "shadow-lg",
        settings?.opacity && `opacity-${settings.opacity}`,
        settings?.animation === "fade" && "animate-fade",
        settings?.animation === "slide" && "animate-slide",
        settings?.animation === "bounce" && "animate-bounce"
      )}
    >
      {renderBlock()}
    </div>
  );
} 