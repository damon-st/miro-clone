"use client";

import { Hint } from "@/components/hint";
import { useMutation, useStorage } from "@/liveblocks.config";
import { Camera, Point, getLayerName } from "@/types/canvas";
import { Layers2, Trash } from "lucide-react";
import React from "react";
type Props = {
  onUserCamera: (camera: Camera) => void;
  onSelectLayer: (e: Point, layerId: string) => void;
};
export const Layers = ({ onUserCamera, onSelectLayer }: Props) => {
  const storage = useStorage((root) => root.layers);
  const deleteLayer = useMutation(({ storage }, id: string) => {
    const layersId = storage.get("layerIds");
    const layers = storage.get("layers");
    const indeX = layersId.indexOf(id);
    if (indeX) {
      layersId.delete(indeX);
    }
    layers.delete(id);
  }, []);
  const deleteElement = (e: React.MouseEvent, id: string) => {
    console.log(id);
    deleteLayer(id);
  };

  return (
    <div className="group transition-all duration-200 flex flex-col gap-y-2">
      <div className="max-h-[50vh] overflow-auto  hidden group-hover:flex  flex-col gap-2 bg-white shadow-sm rounded-sm p-1">
        {Array.from(storage).map((data) => {
          const { icon: Icon, label } = getLayerName(data[1].type);
          return (
            <div
              onPointerEnter={(e) => {
                e.stopPropagation();
                onUserCamera({
                  x: data[1].x,
                  y: data[1].y,
                });
              }}
              onClick={() => {
                onSelectLayer(
                  {
                    x: data[1].x,
                    y: data[1].y,
                  },
                  data[0]
                );
              }}
              key={data[0]}
              className="flex items-center space-x-4 cursor-pointer justify-between transition-colors rounded-md hover:bg-muted p-2"
            >
              <div className="flex items-center space-x-4">
                <span>{label}</span>
                <Icon />
              </div>
              <Hint label="Delete Element">
                <div
                  onClick={(e) => deleteElement(e, data[0])}
                  className="flex items-center justify-center"
                >
                  <Trash size={30} className="text-red-600" />
                </div>
              </Hint>
            </div>
          );
        })}
      </div>
      <Hint label="Layers" side="left">
        <div className="relative rounded-sm bg-white  cursor-pointer shadow-md p-1 flex items-center justify-center">
          <Layers2 size={40} />
          {storage.size != 0 && (
            <div className="absolute top-0 right-0 p-1 rounded-full size4 bg-muted flex items-center">
              {storage.size}
            </div>
          )}
        </div>
      </Hint>
    </div>
  );
};
