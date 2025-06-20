'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Download,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  RotateCw,
  Square,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';

interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

interface CollageSlot {
  id: string;
  image: ImageFile | null;
  position: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

export default function SimpleDirectCollage() {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 600,
    height: 400,
  });
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [collageSlots, setCollageSlots] = useState<CollageSlot[]>([]);
  const [draggedImage, setDraggedImage] = useState<ImageFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auktionsbild Preset
  const setAuctionSize = () => {
    setCanvasSize({ width: 600, height: 400 });
  };

  // Automatisch Slots basierend auf Bildanzahl erstellen
  useEffect(() => {
    const imageCount = uploadedImages.length;
    if (imageCount > 0 && imageCount <= 4) {
      const slots: CollageSlot[] = Array.from(
        { length: imageCount },
        (_, index) => ({
          id: `slot-${index}`,
          image: index < uploadedImages.length ? uploadedImages[index] : null,
          position: index,
        })
      );
      setCollageSlots(slots);
    } else if (imageCount === 0) {
      setCollageSlots([]);
    }
  }, [uploadedImages]);

  // File Upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    Array.from(files)
      .slice(0, 4)
      .forEach((file) => {
        // Max 4 Bilder
        if (file.type.startsWith('image/')) {
          const id = Math.random().toString(36).substr(2, 9);
          const url = URL.createObjectURL(file);

          const newImage: ImageFile = {
            id,
            file,
            url,
            name: file.name,
          };

          newImages.push(newImage);
        }
      });

    setUploadedImages((prev) => [...prev, ...newImages].slice(0, 4));
  }, []);

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, image: ImageFile) => {
    setDraggedImage(image);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();

    if (draggedImage) {
      // Tausche Bilder zwischen Slots
      const targetSlot = collageSlots.find((slot) => slot.id === slotId);
      const sourceSlot = collageSlots.find(
        (slot) => slot.image?.id === draggedImage.id
      );

      if (targetSlot && sourceSlot) {
        setCollageSlots((prev) =>
          prev.map((slot) => {
            if (slot.id === slotId) {
              return { ...slot, image: draggedImage };
            } else if (slot.image?.id === draggedImage.id) {
              return { ...slot, image: targetSlot.image };
            }
            return slot;
          })
        );
      }
      setDraggedImage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Bild entfernen
  const removeImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Slot-Styling berechnen
  const getSlotStyle = (position: number, totalImages: number) => {
    const { width, height } = canvasSize;

    if (totalImages === 1) {
      return { width, height, left: 0, top: 0 };
    }

    if (totalImages === 2) {
      return {
        width: width / 2,
        height: height,
        left: position * (width / 2),
        top: 0,
      };
    }

    if (totalImages === 3) {
      if (position < 2) {
        return {
          width: width / 2,
          height: height / 2,
          left: position * (width / 2),
          top: 0,
        };
      } else {
        return {
          width: width,
          height: height / 2,
          left: 0,
          top: height / 2,
        };
      }
    }

    if (totalImages === 4) {
      const row = Math.floor(position / 2);
      const col = position % 2;
      return {
        width: width / 2,
        height: height / 2,
        left: col * (width / 2),
        top: row * (height / 2),
      };
    }

    return { width: 0, height: 0, left: 0, top: 0 };
  };

  // Export
  const exportCollage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Promise.all(
      collageSlots.map((slot) => {
        return new Promise<void>((resolve) => {
          if (slot.image) {
            const img = new Image();
            img.onload = () => {
              const style = getSlotStyle(slot.position, collageSlots.length);

              const imgAspect = img.width / img.height;
              const slotAspect = style.width / style.height;

              let sourceX = 0,
                sourceY = 0,
                sourceWidth = img.width,
                sourceHeight = img.height;

              if (imgAspect > slotAspect) {
                sourceWidth = img.height * slotAspect;
                sourceX = (img.width - sourceWidth) / 2;
              } else {
                sourceHeight = img.width / slotAspect;
                sourceY = (img.height - sourceHeight) / 2;
              }

              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              ctx.drawImage(
                img,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                style.left,
                style.top,
                style.width,
                style.height
              );
              resolve();
            };
            img.crossOrigin = 'anonymous';
            img.src = slot.image.url;
          } else {
            resolve();
          }
        });
      })
    ).then(() => {
      const dataURL = canvas.toDataURL('image/webp', 1.0);

      const link = document.createElement('a');
      link.download = `collage-${collageSlots.length}-bilder-${
        canvasSize.width
      }x${canvasSize.height}-${Date.now()}.webp`;
      link.href = dataURL;
      link.click();
    });
  };

  // Reset
  const resetAll = () => {
    setUploadedImages([]);
    setCollageSlots([]);
    setDraggedImage(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/project">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Projekten
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Collage erstellen</h1>
            <p className="text-muted-foreground">
              Einfach Bilder hochladen und automatisch Collage erstellen
            </p>
          </div>
        </div>

        {uploadedImages.length > 0 && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetAll}>
              <RotateCw className="h-4 w-4 mr-2" />
              Neu starten
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="space-y-6">
          {/* Canvas Size */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Square className="h-4 w-4 mr-2" />
                Collage-Größe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-16 text-left"
                onClick={setAuctionSize}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded">
                    <Square className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Auktionsbild Standard</div>
                    <div className="text-sm text-muted-foreground">
                      600 × 400 Pixel
                    </div>
                  </div>
                </div>
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width" className="text-sm">
                    Breite
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) =>
                      setCanvasSize((prev) => ({
                        ...prev,
                        width: parseInt(e.target.value) || 0,
                      }))
                    }
                    min="200"
                    max="1200"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm">
                    Höhe
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) =>
                      setCanvasSize((prev) => ({
                        ...prev,
                        height: parseInt(e.target.value) || 0,
                      }))
                    }
                    min="200"
                    max="1200"
                  />
                </div>
              </div>

              {/* Fixed size preview */}
              <div className="text-center bg-gray-50 p-4 rounded">
                <div
                  className="inline-block border border-gray-300 bg-white"
                  style={{
                    width: 120,
                    height: 80,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    Vorschau
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  {canvasSize.width} × {canvasSize.height} px
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Bilder hochladen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                <p className="font-medium mb-1">Bilder hier ablegen</p>
                <p className="text-sm text-muted-foreground">
                  oder klicken • max 4 Bilder
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      Hochgeladene Bilder ({uploadedImages.length})
                    </span>
                    <Badge variant="outline">
                      {uploadedImages.length === 1 && '1 Bild'}
                      {uploadedImages.length === 2 && '2er Layout'}
                      {uploadedImages.length === 3 && '3er Layout'}
                      {uploadedImages.length === 4 && '4er Layout'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="flex items-center space-x-3 p-2 rounded border"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {image.name}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeImage(image.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Collage Canvas */}
        <div className="xl:col-span-2">
          {collageSlots.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Collage: {collageSlots.length} Bilder</span>
                  <Badge variant="outline">
                    {canvasSize.width} × {canvasSize.height} px
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div
                    className="relative border-2 border-gray-300 bg-white shadow-lg"
                    style={{
                      width: Math.min(canvasSize.width * 0.6, 500),
                      height: Math.min(canvasSize.height * 0.6, 333),
                    }}
                  >
                    {collageSlots.map((slot, index) => {
                      const style = getSlotStyle(
                        slot.position,
                        collageSlots.length
                      );
                      const scale = Math.min(
                        500 / canvasSize.width,
                        333 / canvasSize.height,
                        0.6
                      );

                      return (
                        <div
                          key={slot.id}
                          className="absolute border border-gray-400 overflow-hidden bg-gray-50 hover:border-blue-400 transition-colors"
                          style={{
                            left: style.left * scale,
                            top: style.top * scale,
                            width: style.width * scale,
                            height: style.height * scale,
                          }}
                          onDrop={(e) => handleDrop(e, slot.id)}
                          onDragOver={handleDragOver}
                        >
                          {slot.image ? (
                            <>
                              <img
                                src={slot.image.url}
                                alt={slot.image.name}
                                className="w-full h-full object-cover cursor-move"
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, slot.image!)
                                }
                              />
                              <div className="absolute top-1 left-1">
                                <Badge variant="secondary" className="text-xs">
                                  {index + 1}
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                                <div className="text-xs">Slot {index + 1}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Button onClick={exportCollage} size="lg" className="px-8">
                    <Download className="h-4 w-4 mr-2" />
                    WEBP Exportieren
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    💡 So funktioniert's:
                  </p>
                  <p className="text-blue-800">
                    Bilder hochladen → automatisches Layout → Bilder per Drag &
                    Drop tauschen → exportieren
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium mb-2">Keine Bilder hochgeladen</h3>
                <p className="text-muted-foreground mb-4">
                  Lade 1-4 Bilder hoch, um automatisch eine Collage zu erstellen
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
